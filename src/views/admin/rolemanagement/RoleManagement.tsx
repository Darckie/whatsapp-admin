import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";
import Card from "../../../components/card";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { createPortal } from "react-dom";


interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  roles: string[];
  manager?: { id: number; full_name: string };
}

interface Role {
  id: number;
  name: string;
  description?: string;
}

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [userForm, setUserForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    roles: [] as number[],
    manager_id: "",
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users?limit=100");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/admin/roles?limit=100");
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch roles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.full_name || !userForm.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      const payload = {
        ...userForm,
        roles: userForm.roles,
        // account_id:users //pass account id 
        manager_id: userForm.manager_id ? parseInt(userForm.manager_id) : null,
      };

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
        toast.success("User updated successfully");
      } else {
        await api.post("/admin/users", payload);
        toast.success("User created successfully");
      }

      resetUserForm();
      setShowUserModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving user");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting user");
    }
  };

  const handleCreateRole = async () => {
    if (!roleForm.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole.id}`, roleForm);
        toast.success("Role updated successfully");
      } else {
        await api.post("/admin/roles", roleForm);
        toast.success("Role created successfully");
      }

      resetRoleForm();
      setShowRoleModal(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving role");
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      await api.delete(`/admin/roles/${roleId}`);
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting role");
    }
  };

  const resetUserForm = () => {
    setUserForm({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      roles: [],
      manager_id: "",
    });
    setEditingUser(null);
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: "",
      description: "",
    });
    setEditingRole(null);
  };

  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        password: "",
        roles: user.roles as any,
        manager_id: user.manager?.id?.toString() || "",
      });
    } else {
      resetUserForm();
    }
    setShowUserModal(true);
  };

  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        description: role.description || "",
      });
    } else {
      resetRoleForm();
    }
    setShowRoleModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-md bg-white p-6 shadow-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.status === "active").length;

  return (
    <div className="min-h-screen  p-4">
      <div className="mx-auto max-w-[1400px]">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side: Roles + Users */}
          <div className="lg:col-span-2 space-y-6">
            {/* Roles card */}
            <div className="rounded-md bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Roles
                  </h2>
                  <p className="text-xs text-gray-500">
                    Manage available roles and their descriptions.
                  </p>
                </div>
                <button
                  onClick={() => openRoleModal()}
                  className="flex items-center gap-2 rounded bg-teal-400 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
                >
                  <MdAdd size={18} />
                  Add Role
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Description
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr
                        key={role.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-800">
                          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium capitalize text-teal-700">
                            {role.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {role.description || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openRoleModal(role)}
                              className="rounded p-1 text-blue-500 hover:bg-blue-50"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="rounded p-1 text-red-500 hover:bg-red-50"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {roles.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-4 text-center text-xs text-gray-500"
                        >
                          No roles found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Users card */}
            <div className="rounded-md bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Users
                  </h2>
                  <p className="text-xs text-gray-500">
                    Manage users, their roles, and status.
                  </p>
                </div>
                <button
                  onClick={() => openUserModal()}
                  className="flex items-center gap-2 rounded bg-teal-400 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
                >
                  <MdAdd size={18} />
                  Add User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Roles
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {user.full_name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="mr-2 inline-block rounded-full bg-blue-50 px-2 py-1 text-xs capitalize text-blue-700"
                            >
                              {role}
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openUserModal(user)}
                              className="rounded p-1 text-blue-500 hover:bg-blue-50"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="rounded p-1 text-red-500 hover:bg-red-50"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-4 text-center text-xs text-gray-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right side: summary / preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-md bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-center text-sm font-semibold text-gray-800">
                Overview
              </h3>

              <div className="mb-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Total Users</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {users.length}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Active</div>
                  <div className="text-lg font-semibold text-green-600">
                    {activeUsers}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Roles</div>
                  <div className="text-lg font-semibold text-teal-600">
                    {roles.length}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold text-gray-700">
                  Recent Users
                </h4>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-xs"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {user.full_name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {user.email}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {user.roles[0] || "-"}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-[11px] text-gray-500">
                      No users available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Modal */}
        {showUserModal && (
  
        createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 w-full h-full">
              <div className="w-full max-w-md rounded-md bg-white p-6 shadow-xl border border-teal-100 backdrop-blur-md">
                <h3 className="mb-4 text-xl font-bold text-gray-800">
                  {editingUser ? "Edit User" : "Create User"}
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userForm.full_name}
                      onChange={(e) =>
                        setUserForm({ ...userForm, full_name: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({ ...userForm, email: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone (optional)
                    </label>
                    <input
                      type="text"
                      value={userForm.phone}
                      onChange={(e) =>
                        setUserForm({ ...userForm, phone: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            password: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Roles
                    </label>
                    <div className="mt-2 space-y-2">
                      {roles.map((role) => (
                        <label
                          key={role.id}
                          className="flex items-center text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={userForm.roles.includes(role.id as any)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUserForm({
                                  ...userForm,
                                  roles: [...userForm.roles, role.id as any],
                                });
                              } else {
                                setUserForm({
                                  ...userForm,
                                  roles: userForm.roles.filter(
                                    (r) => r !== role.id
                                  ),
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="ml-2 capitalize">{role.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Manager (optional)
                    </label>
                    <select
                      value={userForm.manager_id}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          manager_id: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                      <option value="">No manager</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCreateUser}
                      className="flex-1 rounded bg-teal-400 py-2 text-sm font-medium text-white hover:bg-teal-500"
                    >
                      {editingUser ? "Update" : "Create"}
                    </button>
                    <button
                      onClick={() => {
                        setShowUserModal(false);
                        resetUserForm();
                      }}
                      className="flex-1 rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>, document.body)
   
        )}

        {/* Role Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 w-full h-full">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-teal-100 backdrop-blur-md">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                {editingRole ? "Edit Role" : "Create Role"}
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCreateRole}
                    className="flex-1 rounded bg-teal-400 py-2 text-sm font-medium text-white hover:bg-teal-500"
                  >
                    {editingRole ? "Update" : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      resetRoleForm();
                    }}
                    className="flex-1 rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
