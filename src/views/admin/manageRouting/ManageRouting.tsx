import { useState } from 'react';
import DataTable from 'react-data-table-component';
import { BsPlusCircle } from 'react-icons/bs';

type RoutingRule = {
    id: number;
    priority: number;
    ruleName: string;
    startTime: string;
    endTime: string;
    fulfillment: string;
    createdAt: string;
};

export default function ManageRoutingRules() {
    const [rules, setRules] = useState<RoutingRule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        ruleName: '',
        connector: 'Any',
        startTime: '12:00 AM',
        endTime: '11:59 PM',
        payloadText: 'Any',
        logicType: 'OR',
        target: 'Agent',
        assignTo: ''
    });

    const handleSave = () => {
        const newRule: RoutingRule = {
            id: rules.length + 1,
            priority: rules.length + 1,
            ruleName: formData.ruleName,
            startTime: formData.startTime,
            endTime: formData.endTime,
            fulfillment: `${formData.target} - ${formData.assignTo || 'Unassigned'}`,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setRules([...rules, newRule]);
        setIsModalOpen(false);
        setFormData({
            ruleName: '',
            connector: 'Any',
            startTime: '12:00 AM',
            endTime: '11:59 PM',
            payloadText: 'Any',
            logicType: 'OR',
            target: 'Agent',
            assignTo: ''
        });
    };

    const columns = [
        { name: 'Priority', selector: (row: RoutingRule) => row.priority, sortable: true, width: '100px' },
        { name: 'Rule Name', selector: (row: RoutingRule) => row.ruleName, sortable: true },
        { name: 'Start Time', selector: (row: RoutingRule) => row.startTime },
        { name: 'End Time', selector: (row: RoutingRule) => row.endTime },
        { name: 'Fulfillment', selector: (row: RoutingRule) => row.fulfillment },
        { name: 'Create Date', selector: (row: RoutingRule) => row.createdAt },
        {
            name: 'Action',
            cell: () => <span className="text-blue-600 cursor-pointer hover:underline">Edit</span>
        }
    ];

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            <div className="mb-4 flex justify-between items-center">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded bg-teal-400 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
                >
                    <BsPlusCircle className="inline mr-1" />
                    Add Routing Rule
                </button>
            </div>

            <div className="rounded-md bg-white p-4 shadow-sm">
                <DataTable
                    columns={columns}
                    data={rules}
                    noDataComponent="No Rules To Display"
                    pagination
                    highlightOnHover
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="w-full max-w-2xl rounded bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-xl font-semibold text-gray-800 text-center">Add Routing Details</h3>
                        <form className="space-y-6">

                            {/* Identity Section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Identity</h4>
                                <label className="text-sm font-medium text-gray-700">
                                    Rule Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.ruleName}
                                    onChange={e => setFormData({ ...formData, ruleName: e.target.value })}
                                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            {/* Scope Section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Scope</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Connector</label>
                                        <select
                                            value={formData.connector}
                                            onChange={e => setFormData({ ...formData, connector: e.target.value })}
                                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                        >
                                            <option value="Any">Any</option>
                                            <option value="SMS">SMS</option>
                                            <option value="Email">Email</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Time Between</label>
                                        <div className="flex gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={formData.startTime}
                                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                                className="w-full rounded border px-3 py-2 text-sm"
                                                placeholder="Start"
                                            />
                                            <input
                                                type="text"
                                                value={formData.endTime}
                                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                                className="w-full rounded border px-3 py-2 text-sm"
                                                placeholder="End"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logic Section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Logic</h4>
                                <div className="space-y-3">
                                    {[{ id: 1 }].map((_, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-4 items-end">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Payload Text</label>
                                                <select
                                                    value={formData.payloadText}
                                                    onChange={e => setFormData({ ...formData, payloadText: e.target.value })}
                                                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                                >
                                                    <option value="Any">Any</option>
                                                    <option value="Contains">Contains</option>
                                                    <option value="Starts With">Starts With</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className={`px-4 py-2 rounded text-sm font-medium ${formData.logicType === 'OR' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                                                        }`}
                                                    onClick={() => setFormData({ ...formData, logicType: 'OR' })}
                                                >
                                                    OR
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-4 py-2 rounded text-sm font-medium ${formData.logicType === 'AND' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                                                        }`}
                                                    onClick={() => setFormData({ ...formData, logicType: 'AND' })}
                                                >
                                                    AND
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Add/Remove logic rows (optional) */}
                                    <div className="flex gap-2">
                                        <button type="button" className="text-sm text-blue-600 hover:underline">+ Add Condition</button>
                                        <button type="button" className="text-sm text-red-600 hover:underline">Remove</button>
                                    </div>
                                </div>
                            </div>

                            {/* Fulfillment Section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Fulfillment</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Target</label>
                                        <select
                                            value={formData.target}
                                            onChange={e => setFormData({ ...formData, target: e.target.value })}
                                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                        >
                                            <option value="Agent">Agent</option>
                                            <option value="Queue">Queue</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Assign To</label>
                                        <select
                                            value={formData.assignTo}
                                            onChange={e => setFormData({ ...formData, assignTo: e.target.value })}
                                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                        >
                                            <option value="">Select Agent</option>
                                            <option value="Agent A">Agent A</option>
                                            <option value="Agent B">Agent B</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded bg-yellow-400 px-4 py-2 text-sm text-white hover:bg-yellow-500"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}