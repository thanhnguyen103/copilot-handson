import { TaskService } from "../TaskService";

const mockTaskModel = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  getTasksByUser: jest.fn(),
};

describe('TaskService', () => {
  let service: TaskService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaskService(mockTaskModel as any);
  });

  it('should validate and create a task', async () => {
    const taskData = { title: 'Test', user_id: 1, status: 'pending' };
    mockTaskModel.create.mockResolvedValue({ ...taskData, id: 1, created_at: new Date(), updated_at: new Date() });
    const result = await service.createTask(taskData as any);
    expect(result.title).toBe('Test');
    expect(mockTaskModel.create).toHaveBeenCalled();
  });

  it('should throw on invalid title', async () => {
    await expect(service.createTask({ title: '', user_id: 1, status: 'pending' } as any)).rejects.toThrow('Title is required.');
  });

  it('should throw on invalid due date', async () => {
    await expect(service.createTask({ title: 'A', user_id: 1, status: 'pending', due_date: 'bad-date' } as any)).rejects.toThrow('Due date is invalid.');
  });

  it('should get a task by id', async () => {
    mockTaskModel.findById.mockResolvedValue({ id: 1, title: 'T', user_id: 1, status: 'pending', created_at: new Date(), updated_at: new Date() });
    const result = await service.getTaskById(1);
    expect(result).toBeTruthy();
    expect(mockTaskModel.findById).toHaveBeenCalledWith(1);
  });

  it('should update a task', async () => {
    mockTaskModel.update.mockResolvedValue({ id: 1, title: 'U', user_id: 1, status: 'pending', created_at: new Date(), updated_at: new Date() });
    const result = await service.updateTask(1, { title: 'U' });
    expect(result?.title).toBe('U');
  });

  it('should throw on invalid update due date', async () => {
    await expect(service.updateTask(1, { due_date: 'bad-date' } as any)).rejects.toThrow('Due date is invalid.');
  });

  it('should delete a task', async () => {
    mockTaskModel.delete.mockResolvedValue(true);
    const result = await service.deleteTask(1);
    expect(result).toBe(true);
  });

  it('should get tasks with filter', async () => {
    mockTaskModel.findAll.mockResolvedValue([{ id: 1, title: 'T', user_id: 1, status: 'pending', created_at: new Date(), updated_at: new Date() }]);
    const result = await service.getTasks({ user_id: 1 });
    expect(result.length).toBe(1);
  });

  it('should mark task as completed', async () => {
    mockTaskModel.update.mockResolvedValue({ id: 1, title: 'T', user_id: 1, status: 'completed', created_at: new Date(), updated_at: new Date() });
    const result = await service.markTaskCompleted(1);
    expect(result?.status).toBe('completed');
  });

  it('should get overdue tasks', async () => {
    mockTaskModel.findAll.mockResolvedValue([]);
    const result = await service.getOverdueTasks(1);
    expect(Array.isArray(result)).toBe(true);
  });
});
