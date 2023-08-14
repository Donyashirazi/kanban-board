import { useMemo, useState } from 'react';
import PlusIcon from './icons/PlusIcon';
import { Column, Id, Task } from '../types';
import ColumnContainer from './ColumnContainer';
import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

const KanbanBoerd = () => {
	const [columns, setColumns] = useState<Column[]>([]);
	const [activeColumn, setActiveColumn] = useState<Column | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
	);

	const generateId = () => {
		return Math.floor(Math.random() * 10001);
	};
	const createNewColumn = () => {
		const columnToAdd: Column = {
			id: generateId(),
			title: `column ${columns.length + 1}`,
		};
		setColumns([...columns, columnToAdd]);
	};
	const deleteColumn = (id: Id) => {
		const filteredColumns = columns.filter((col) => col.id !== id);
		setColumns(filteredColumns);
	};

	const onDragStart = (event: DragStartEvent) => {
		const eventColumn = event.active.data.current;
		const eventTask = event.active.data.current;
		if (eventColumn?.type === 'column') {
			setActiveColumn(eventColumn.column);
			return;
		}
		if (eventTask?.type === 'task') {
			setActiveTask(eventTask.task);
			return;
		}
	};
	const onDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;
		const activeColumnId = active.id;
		const overColumnId = over.id;
		if (activeColumnId === overColumnId) return;

		setColumns((columns) => {
			const activeColumnIndex = columns.findIndex(
				(col) => col.id === activeColumnId
			);
			const overColumnIndex = columns.findIndex(
				(col) => col.id === overColumnId
			);
			return arrayMove(columns, activeColumnIndex, overColumnIndex);
		});

		// const findIndex = (columns) => {
		// 	const activeColumnIndex = columns.findIndex(
		// 		(col) => col.id === activeColumnId
		// 	);
		// 	const overColumnIndex = columns.findIndex(
		// 		(col) => col.id === overColumnId
		// 	);
		// 	return arrayMove(columns, activeColumnIndex, overColumnIndex);
		// };

		// setColumns(findIndex());
	};

	const onDragOver = (event: DragOverEvent) => {
		setActiveColumn(null);
		setActiveTask(null);

		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		const isActiveTask = active.data.current?.type === 'Task';
		const isOverTask = over.data.current?.type === 'Task';

		if (isActiveTask && isOverTask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const overIndex = tasks.findIndex((t) => t.id === overId);

				return arrayMove(tasks, activeIndex, overIndex);
			});
		}
	};

	const updateColumn = (id: Id, title: string) => {
		const newColumns = columns.map((col) => {
			if (col.id !== id) return col;
			return { ...col, title };
		});
		setColumns(newColumns);
	};

	const createTask = (columnId: Id) => {
		const newTask = {
			id: generateId(),
			columnId,
			content: `Task ${tasks.length + 1}`,
		};
		setTasks([...tasks, newTask]);
	};
	//why {} changes everything?
	const deleteTask = (id: Id) => {
		const newTasks = tasks.filter((task) => task.id !== id);
		setTasks(newTasks);
	};
	const updateTask = (id: Id, content: string) => {
		const newTasks = tasks.map((task) => {
			if (task.id !== id) return task;
			return { ...task, content };
		});
		setTasks(newTasks);
	};

	return (
		<div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
			<DndContext
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				sensors={sensors}
				onDragOver={onDragOver}
			>
				<div className="m-auto flex gap-4">
					<div className="flex gap-4">
						<SortableContext items={columnsId}>
							{columns.map((col) => (
								<ColumnContainer
									key={col.id}
									column={col}
									deleteColumn={deleteColumn}
									updateColumn={updateColumn}
									createTask={createTask}
									tasks={tasks.filter(
										(task) => task.columnId === col.id
									)}
									deleteTask={deleteTask}
									updateTask={updateTask}
								/>
							))}
						</SortableContext>
					</div>
					<button
						onClick={() => createNewColumn()}
						className="flex h-[60x] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 gap-2 hover:ring-2"
					>
						<PlusIcon />
						Add Column
					</button>
				</div>
				{createPortal(
					<DragOverlay>
						{activeColumn && (
							<ColumnContainer
								column={activeColumn}
								deleteColumn={deleteColumn}
								updateColumn={updateColumn}
								createTask={createTask}
								tasks={tasks.filter(
									(task) => task.columnId === activeColumn.id
								)}
								deleteTask={deleteTask}
								updateTask={updateTask}
							/>
						)}
						{activeTask && (
							<TaskCard
								task={activeTask}
								deleteTask={deleteTask}
								updateTask={updateTask}
							/>
						)}
					</DragOverlay>,
					document.body
				)}
			</DndContext>
		</div>
	);
};

export default KanbanBoerd;
