// services/workflows/engine.ts
// WorkflowEngine — task lifecycle, SLA tracking, notifications, audit

import { db } from '@/lib/db'

export class WorkflowEngine {
  async createTask(params: {
    siteId: string
    title: string
    taskType: string
    priority?: string
    description?: string
    ownerId?: string
    slaHours?: number
    agentRunId?: string
  }): Promise<string> {
    const task = await db.workflowTask.create({
      data: {
        siteId:      params.siteId,
        title:       params.title,
        taskType:    params.taskType as any,
        priority:    (params.priority ?? 'MEDIUM') as any,
        status:      'OPEN',
        description: params.description ?? null,
        ownerId:     params.ownerId ?? null,
        slaHours:    params.slaHours ?? null,
        agentRunId:  params.agentRunId ?? null,
        dueDate:     params.slaHours
          ? new Date(Date.now() + params.slaHours * 3_600_000)
          : null,
      },
    })
    return task.id
  }

  async startTask(taskId: string, userId: string): Promise<void> {
    await db.workflowTask.update({
      where: { id: taskId },
      data:  { status: 'IN_PROGRESS' },
    })
    await this._audit(userId, 'TASK_START', 'WorkflowTask', taskId)
  }

  async completeTask(taskId: string, userId: string): Promise<void> {
    const task = await db.workflowTask.findUniqueOrThrow({ where: { id: taskId } })
    await db.workflowTask.update({
      where: { id: taskId },
      data:  { status: 'COMPLETED', completedAt: new Date() },
    })
    await this._audit(userId, 'TASK_COMPLETE', 'WorkflowTask', taskId, task.siteId)
  }

  async blockTask(taskId: string, userId: string, reason?: string): Promise<void> {
    await db.workflowTask.update({
      where: { id: taskId },
      data:  { status: 'BLOCKED', description: reason },
    })
    await this._audit(userId, 'TASK_BLOCK', 'WorkflowTask', taskId)
  }

  async escalateOverdue(): Promise<number> {
    const overdue = await db.workflowTask.findMany({
      where: {
        status:  { in: ['OPEN', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() },
      },
    })
    if (overdue.length) {
      await db.workflowTask.updateMany({
        where: { id: { in: overdue.map(t => t.id) } },
        data:  { status: 'ESCALATED', escalatedAt: new Date() },
      })
    }
    return overdue.length
  }

  async notify(params: {
    userId: string
    siteId?: string | null
    title: string
    body?: string
    type: string
    actionUrl?: string
  }): Promise<void> {
    await db.notification.create({
      data: {
        userId:    params.userId,
        siteId:    params.siteId ?? null,
        title:     params.title,
        body:      params.body ?? null,
        type:      params.type as any,
        actionUrl: params.actionUrl ?? null,
      },
    })
  }

  async getOpenTasksForSite(siteId: string) {
    return db.workflowTask.findMany({
      where:   { siteId, status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] } },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      include: { owner: { select: { id: true, name: true } } },
    })
  }

  async getOverdueTasksForSite(siteId: string) {
    return db.workflowTask.findMany({
      where: {
        siteId,
        status:  { in: ['OPEN', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() },
      },
    })
  }

  private async _audit(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    siteId?: string,
  ): Promise<void> {
    await db.auditLog.create({
      data: { userId, siteId: siteId ?? null, action, entityType, entityId },
    })
  }
}

export const workflowEngine = new WorkflowEngine()
