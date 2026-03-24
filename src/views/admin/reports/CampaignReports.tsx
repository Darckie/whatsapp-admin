import React, { useState } from 'react';
import { 
  BsCalendar3, 
  BsSearch, 
  BsDownload, 
  BsEye,
  BsTrash,
  BsPause,
  BsPlay,
  BsCheckCircle,
  BsXCircle,
  BsClock
} from 'react-icons/bs';
import DataTable from 'react-data-table-component';

// Campaign Report Component
export function CampaignReport() {
  const [activeView, setActiveView] = useState('campaign');
  const [dateRange, setDateRange] = useState('today');
  const [searchText, setSearchText] = useState('');

  const campaigns = [
    {
      id: 1,
      createDate: '2025-11-10 09:30',
      campaignName: 'Camp_11/10/2025, 9:30:00 AM',
      senderId: 'Connector 1',
      message: 'Hello! This is a promotional message...',
      totalCount: 150,
      status: 'Completed',
      cost: '$15.50'
    },
    {
      id: 2,
      createDate: '2025-11-09 14:20',
      campaignName: 'Camp_11/09/2025, 2:20:00 PM',
      senderId: 'Connector 2',
      message: 'Reminder: Your appointment is tomorrow',
      totalCount: 89,
      status: 'Running',
      cost: '$8.90'
    },
    {
      id: 3,
      createDate: '2025-11-08 11:15',
      campaignName: 'Camp_11/08/2025, 11:15:00 AM',
      senderId: 'Connector 1',
      message: 'Thank you for your purchase!',
      totalCount: 234,
      status: 'Failed',
      cost: '$0.00'
    },
    {
      id: 4,
      createDate: '2025-11-07 16:45',
      campaignName: 'Camp_11/07/2025, 4:45:00 PM',
      senderId: 'Connector 2',
      message: 'New product launch announcement',
      totalCount: 512,
      status: 'Completed',
      cost: '$51.20'
    },
    {
      id: 5,
      createDate: '2025-11-06 10:00',
      campaignName: 'Camp_11/06/2025, 10:00:00 AM',
      senderId: 'Connector 1',
      message: 'Weekend special offer',
      totalCount: 324,
      status: 'Completed',
      cost: '$32.40'
    }
  ];

  const columns = [
    {
      name: 'Create Date',
      selector:(row:any)=> row.createDate,
      sortable: true,
      width: '140px'
    },
    {
      name: 'Campaign Name',
      selector:(row:any)=> row.campaignName,
      sortable: true,
      grow: 2
    },
    {
      name: 'Sender Id',
      selector:(row:any)=> row.senderId,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Message',
      selector:(row:any)=> row.message,
      sortable: true,
      grow: 2,
      cell:(row:any)=> (
        <div className="truncate max-w-xs" title={row.message}>
          {row.message}
        </div>
      )
    },
    {
      name: 'Total Count',
      selector:(row:any)=> row.totalCount,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Status',
      selector:(row:any)=> row.status,
      sortable: true,
      width: '140px',
      cell:(row:any)=> {
        const status = row.status;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              status === 'Completed'
                ? 'bg-green-100 text-green-700'
                : status === 'Running'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {status === 'Completed' && <BsCheckCircle />}
            {status === 'Running' && <BsClock />}
            {status === 'Failed' && <BsXCircle />}
            {status}
          </span>
        );
      }
    },
    {
      name: 'Actions',
      width: '120px',
      cell:(row:any)=> (
        <div className="flex items-center gap-2">
          <button className="rounded p-1 text-blue-600 hover:bg-blue-50" title="View">
            <BsEye size={16} />
          </button>
          {row.status === 'Running' && (
            <button className="rounded p-1 text-orange-600 hover:bg-orange-50" title="Pause">
              <BsPause size={16} />
            </button>
          )}
          <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Delete">
            <BsTrash size={16} />
          </button>
        </div>
      )
    },
    {
      name: 'Cost ($MS)',
      selector:(row:any)=> row.cost,
      sortable: true,
      width: '110px'
    }
  ];

  const filteredData = campaigns.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        minHeight: '48px'
      }
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    },
    cells: {
      style: {
        fontSize: '14px',
        color: '#4b5563',
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    },
    rows: {
      style: {
        minHeight: '56px',
        '&:hover': {
          backgroundColor: '#f9fafb',
          cursor: 'pointer'
        }
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mx-auto max-w-[1400px]">
       

        <div className="rounded-md bg-white p-6 shadow-sm">
          {/* View Toggle */}
          <div className="mb-6 flex items-center gap-4 border-b border-gray-200 pb-4">
            <span className="font-semibold text-gray-800">REPORTS :</span>
            <button
              onClick={() => setActiveView('campaign')}
              className={`px-4 py-2 text-sm font-medium ${
                activeView === 'campaign'
                  ? 'border-b-2 border-teal-500 text-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Campaign View
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 text-sm font-medium ${
                activeView === 'list'
                  ? 'border-b-2 border-teal-500 text-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              List View
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Preferred Range :</span>
            {['Today', 'Yesterday', 'Last 2 Days', 'Tomorrow', 'Custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range.toLowerCase())}
                className={`rounded border px-3 py-1 text-sm ${
                  dateRange === range.toLowerCase()
                    ? 'border-teal-500 bg-teal-50 text-teal-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4 flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Search:</span>
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="rounded border border-gray-300 px-3 py-1 text-sm"
                placeholder="Search all columns..."
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
          />
        </div>
      </div>
    </div>
  );
}

// Message Count Report Component
export function MessageCountReport() {
  const [dateRange] = useState('November 10, 2025 - November 10, 2025');
  const [searchText, setSearchText] = useState('');

  const messageData = [
    { id: 1, date: '2025-11-10', sent: 423, delivered: 398, read: 312, warning: 12, deleted: 5, failed: 8, total: 423 },
    { id: 2, date: '2025-11-09', sent: 289, delivered: 275, read: 201, warning: 8, deleted: 2, failed: 4, total: 289 },
    { id: 3, date: '2025-11-08', sent: 567, delivered: 542, read: 489, warning: 15, deleted: 7, failed: 3, total: 567 },
    { id: 4, date: '2025-11-07', sent: 345, delivered: 330, read: 289, warning: 10, deleted: 3, failed: 2, total: 345 },
    { id: 5, date: '2025-11-06', sent: 678, delivered: 655, read: 598, warning: 18, deleted: 4, failed: 1, total: 678 }
  ];

  const columns = [
    {
      name: 'Date',
      selector:(row:any)=> row.date,
      sortable: true,
      width: '140px'
    },
    {
      name: 'Sent',
      selector:(row:any)=> row.sent,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Delivered',
      selector:(row:any)=> row.delivered,
      sortable: true,
      width: '120px',
      cell:(row:any)=> <span className="text-green-600 font-medium">{row.delivered}</span>
    },
    {
      name: 'Read',
      selector:(row:any)=> row.read,
      sortable: true,
      width: '100px',
      cell:(row:any)=> <span className="text-blue-600 font-medium">{row.read}</span>
    },
    {
      name: 'Warning',
      selector:(row:any)=> row.warning,
      sortable: true,
      width: '110px',
      cell:(row:any)=> <span className="text-yellow-600 font-medium">{row.warning}</span>
    },
    {
      name: 'Deleted',
      selector:(row:any)=> row.deleted,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Failed',
      selector:(row:any)=> row.failed,
      sortable: true,
      width: '100px',
      cell:(row:any)=> <span className="text-red-600 font-medium">{row.failed}</span>
    },
    {
      name: 'Total Count',
      selector:(row:any)=> row.total,
      sortable: true,
      width: '120px',
      cell:(row:any)=> <span className="font-semibold text-gray-900">{row.total}</span>
    }
  ];

  const filteredData = messageData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        minHeight: '48px'
      }
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    },
    cells: {
      style: {
        fontSize: '14px',
        color: '#4b5563',
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    },
    rows: {
      style: {
        minHeight: '56px',
        '&:hover': {
          backgroundColor: '#f9fafb'
        }
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mx-auto max-w-[1400px]">
       

        <div className="rounded-md bg-white p-6 shadow-sm">
          {/* Date Range Picker */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded border border-gray-300 bg-blue-500 px-4 py-2 text-white">
              <BsCalendar3 />
              <span className="text-sm">{dateRange}</span>
            </div>
            <button className="flex items-center gap-2 rounded bg-teal-400 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">
              <BsSearch />
              Submit
            </button>
          </div>

          {/* Search */}
          <div className="mb-4 flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Search:</span>
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="rounded border border-gray-300 px-3 py-1 text-sm"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            customStyles={customStyles}
            highlightOnHover
          />
        </div>
      </div>
    </div>
  );
}

// My Schedule Component
export function MySchedule() {
  const [searchText, setSearchText] = useState('');

  const schedules = [
    {
      id: 1,
      scheduleDate: '2025-11-12 10:00',
      campaignName: 'Camp_11/12/2025, 10:00:00 AM',
      message: 'Flash Sale Alert! 50% off on all items',
      totalContacts: 500,
      status: 'Pending'
    },
    {
      id: 2,
      scheduleDate: '2025-11-13 14:30',
      campaignName: 'Camp_11/13/2025, 2:30:00 PM',
      message: 'Weekly Newsletter - November Edition',
      totalContacts: 1250,
      status: 'Pending'
    },
    {
      id: 3,
      scheduleDate: '2025-11-15 09:00',
      campaignName: 'Camp_11/15/2025, 9:00:00 AM',
      message: 'Event Reminder: Register now!',
      totalContacts: 320,
      status: 'Scheduled'
    }
  ];

  const columns = [
    {
      name: 'Schedule Date',
      selector:(row:any)=> row.scheduleDate,
      sortable: true,
      width: '180px'
    },
    {
      name: 'Campaign Name',
      selector:(row:any)=> row.campaignName,
      sortable: true,
      grow: 2
    },
    {
      name: 'Message',
      selector:(row:any)=> row.message,
      sortable: true,
      grow: 2,
      cell:(row:any)=> (
        <div className="truncate max-w-xs" title={row.message}>
          {row.message}
        </div>
      )
    },
    {
      name: 'Total Contacts',
      selector: (row:any) => row.totalContacts,
      sortable: true,
      width: '140px'
    },
    {
      name: 'Status',
      selector:(row:any)=> row.status,
      sortable: true,
      width: '140px',
      cell:(row:any)=> {
        const status = row.status;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              status === 'Scheduled'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            <BsClock />
            {status}
          </span>
        );
      }
    },
    {
      name: 'Actions',
      width: '140px',
      cell: () => (
        <div className="flex items-center gap-2">
          <button className="rounded p-1 text-blue-600 hover:bg-blue-50" title="View">
            <BsEye size={16} />
          </button>
          <button className="rounded p-1 text-green-600 hover:bg-green-50" title="Execute Now">
            <BsPlay size={16} />
          </button>
          <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Delete">
            <BsTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  const filteredData = schedules.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        minHeight: '48px'
      }
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    },
    cells: {
      style: {
        fontSize: '14px',
        color: '#4b5563',
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    },
    rows: {
      style: {
        minHeight: '56px',
        '&:hover': {
          backgroundColor: '#f9fafb',
          cursor: 'pointer'
        }
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mx-auto max-w-[1400px]">
       

        <div className="rounded-md bg-white p-6 shadow-sm">
          {/* Search */}
          <div className="mb-4 flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Search:</span>
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="rounded border border-gray-300 px-3 py-1 text-sm"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
          />
        </div>
      </div>
    </div>
  );
}

// Download WhatsApp Report Component
export function DownloadWhatsAppReport() {
  const [dateRange] = useState('November 10, 2025 - November 10, 2025');
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  return (
    <div className="p-4">
      <div className="mx-auto max-w-[1400px]">
       

        <div className="rounded-md bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Select a date range and campaign to download detailed WhatsApp message reports in Excel format.
            </p>
          </div>

          {/* Filter Section */}
          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Date Range</label>
              <div className="flex items-center gap-2 rounded border border-gray-300 bg-blue-500 px-4 py-2 text-white w-fit">
                <BsCalendar3 />
                <span className="text-sm">{dateRange}</span>
              </div>
            </div>

            {/* Campaign Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Select Campaign</label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full max-w-md rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All Campaigns</option>
                <option value="camp1">Camp_11/10/2025, 9:30:00 AM</option>
                <option value="camp2">Camp_11/09/2025, 2:20:00 PM</option>
                <option value="camp3">Camp_11/08/2025, 11:15:00 AM</option>
              </select>
            </div>

            {/* Report Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Report Type</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="reportType" value="detailed" defaultChecked className="h-4 w-4" />
                  <span className="text-sm text-gray-700">Detailed Report (All message statuses)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="reportType" value="summary" className="h-4 w-4" />
                  <span className="text-sm text-gray-700">Summary Report (Campaign overview)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="reportType" value="failed" className="h-4 w-4" />
                  <span className="text-sm text-gray-700">Failed Messages Only</span>
                </label>
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-4">
              <button className="flex items-center gap-2 rounded bg-teal-400 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-500">
                <BsDownload />
                Download Report (Excel)
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 rounded-md bg-blue-50 border border-blue-200 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-900">Report Information</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Reports include: Campaign name, contact number, message status, delivery time, and costs</li>
              <li>• Excel format is compatible with Microsoft Excel and Google Sheets</li>
              <li>• Large reports may take a few moments to generate</li>
              <li>• Reports are generated based on your selected date range and filters</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


