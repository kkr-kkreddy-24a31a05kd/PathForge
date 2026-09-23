import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { Users, ShieldCheck, Building, GraduationCap, Mail, Calendar } from 'lucide-react';

const PlatformUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users', {
        params: { role: roleFilter }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to retrieve user directory. Please check network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Platform User & Entity Directory
          </h2>
          <p className="text-xs text-ink-body dark:text-ink-bodyDark">
            Complete database of student scholars, registered enterprise partners, and administrators.
          </p>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-subtleDark text-ink-heading dark:text-white text-xs"
        >
          <option value="all">All Roles</option>
          <option value="student">Students Only</option>
          <option value="company">Companies Only</option>
          <option value="admin">Administrators Only</option>
        </select>
      </div>

      {error && (
        <div className="p-3.5 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchUsers()} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted">Loading user directory...</div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try selecting a different role filter."
        />
      ) : (
        <div className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-light dark:bg-bg-subtleDark border-b border-border-light dark:border-border-dark uppercase font-semibold text-[10px] tracking-wider text-ink-muted dark:text-ink-mutedDark">
                <tr>
                  <th className="p-4">User / Entity</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Details / Skills</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-bg-subtleDark/40">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand/10 dark:bg-brand-light/20 text-brand dark:text-blue-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-ink-heading dark:text-white leading-tight">
                            {u.role === 'company' && u.companyDetails?.companyName ? u.companyDetails.companyName : u.name}
                          </p>
                          <p className="text-[11px] text-ink-muted dark:text-ink-mutedDark">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="capitalize font-semibold text-ink-heading dark:text-white">
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.role === 'student' && (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(u.studentDetails?.skills || []).slice(0, 3).map((s, idx) => (
                            <Badge key={idx} variant="skill" size="sm">{s}</Badge>
                          ))}
                          {(u.studentDetails?.skills || []).length > 3 && (
                            <span className="text-[10px] text-ink-muted">+{u.studentDetails.skills.length - 3}</span>
                          )}
                        </div>
                      )}
                      {u.role === 'company' && (
                        <span className="text-ink-muted">
                          {u.companyDetails?.industry || 'Technology'} &bull; {u.companyDetails?.location || 'Remote'}
                        </span>
                      )}
                      {u.role === 'admin' && (
                        <span className="text-match font-semibold">Institutional Director</span>
                      )}
                    </td>

                    <td className="p-4">
                      {u.role === 'company' ? (
                        u.isApproved ? (
                          <Badge variant="accepted" size="sm">Verified</Badge>
                        ) : (
                          <Badge variant="submitted" size="sm">Pending Approval</Badge>
                        )
                      ) : (
                        <Badge variant="open" size="sm">Active</Badge>
                      )}
                    </td>

                    <td className="p-4 text-ink-muted whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformUsers;
