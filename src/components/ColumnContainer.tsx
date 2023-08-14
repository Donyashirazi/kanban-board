import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Column, Id, Task } from '../types';
import TrashIcon from './icons/TrashIcon';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import PlusIcon from './icons/PlusIcon';
import TaskCard from './TaskCard';
interface Props {
	column: Column;
	deleteColumn: (id: Id) => void;
	updateColumn: (id: Id, title: string) => void;
	createTask: (columnId: Id) => void;
	deleteTask: (id: Id) => void;
	updateTask: (id: Id, content: string) => void;
	tasks: Task[];
}

const ColumnContainer = (props: Props) => {
	const [editMode, setEditMode] = useState(false);

	const {
		column,
		deleteColumn,
		updateColumn,
		createTask,
		deleteTask,
		updateTask,
		tasks,
	} = props;
	const tasksIds = useMemo(() => {
		return tasks.map((task) => task.id);
	}, [tasks]);

	const {
		setNodeRef,
		transform,
		transition,
		attributes,
		listeners,
		isDragging,
	} = useSortable({
		id: column.id,
		data: {
			type: 'column',
			column,
		},
		disabled: editMode,
	});

	const style = { transition, transform: CSS.Transform.toString(transform) };

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="opacity-40 border-2 border-rose-500 bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col "
			/>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col "
		>
			<div
				{...attributes}
				{...listeners}
				onClick={() => setEditMode(true)}
				className="flex justify-between bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4"
			>
				<div className="flex gap-2">
					<div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-2 text-sm rounded-full ">
						0
					</div>
					{!editMode && column.title}

					{editMode && (
						<input
							className="bg-black focus:border-rose-500 border rounded outline-none px-2"
							value={column.title}
							onChange={(e) =>
								updateColumn(column.id, e.target.value)
							}
							autoFocus
							onBlur={() => {
								setEditMode(false);
							}}
							onKeyDown={(e) => {
								if (e.key !== 'Enter') return;
								setEditMode(false);
							}}
						/>
					)}
				</div>
				<button
					onClick={() => deleteColumn(column.id)}
					className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1"
				>
					<TrashIcon />
				</button>
			</div>
			<div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
				<SortableContext items={tasksIds}>
					{tasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							deleteTask={deleteTask}
							updateTask={updateTask}
						/>
					))}
				</SortableContext>
			</div>

			<button
				onClick={() => createTask(column.id)}
				className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black"
			>
				<PlusIcon />
				<h2>Add Task</h2>
			</button>
		</div>
	);
};

export default ColumnContainer;
