    import { Handle, Position } from 'reactflow';

    type CustomNodeProps = {
    data: {
        label: string;
    };
    };

    export default function CustomNode({ data }: CustomNodeProps) {
    return (
        <div className="bg-white border border-gray-300 rounded shadow-md p-3 w-64">
        <Handle type="target" position={Position.Top} />
        <textarea
            defaultValue={data.label}
            className="w-full bg-gray-100 p-2 border rounded resize-none text-sm"
        />
        <Handle type="source" position={Position.Bottom} />
        </div>
    );
    }
