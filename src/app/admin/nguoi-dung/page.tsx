'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Edit, 
  CheckCircle2, 
  UserPlus, 
  X, 
  Mail, 
  Building, 
  AlertCircle 
} from 'lucide-react';
import { UserRole } from '@/types/database';

interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  is_active: boolean;
}

const INITIAL_STAFF: StaffUser[] = [
  { id: 'u-admin', email: 'admin@newshub.vn', full_name: 'Tổng Quản Trị Viên', role: 'super_admin', department: 'Hội đồng Quản trị', is_active: true },
  { id: 'u-eic', email: 'tongbientap@newshub.vn', full_name: 'Nguyễn Văn Hoài', role: 'editor_in_chief', department: 'Ban Tổng Biên Tập', is_active: true },
  { id: 'u-ed-1', email: 'le.mai@newshub.vn', full_name: 'Lê Thanh Mai', role: 'editor', department: 'Ban Công nghệ & Số', is_active: true },
  { id: 'u-rep-1', email: 'nguyen.anh@newshub.vn', full_name: 'Nguyễn Tuấn Anh', role: 'reporter', department: 'Ban Thời sự - Chính trị', is_active: true },
  { id: 'u-rep-2', email: 'tran.nam@newshub.vn', full_name: 'Trần Hải Nam', role: 'reporter', department: 'Ban Kinh tế & Thị trường', is_active: true },
  { id: 'u-ads', email: 'ads.lead@newshub.vn', full_name: 'Vũ Thu Trang', role: 'ads_manager', department: 'Ban Quảng cáo & Doanh thu', is_active: true },
  { id: 'u-mod', email: 'mod.lead@newshub.vn', full_name: 'Đặng Quốc Huy', role: 'moderator', department: 'Ban Kiểm duyệt Độc giả', is_active: true },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffUser[]>(INITIAL_STAFF);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Ban Thời sự - Chính trị');
  const [role, setRole] = useState<UserRole>('reporter');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast(`Đã cập nhật vai trò phân quyền thành công!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ họ tên và email tòa soạn.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg('Email này đã tồn tại trong danh sách tòa soạn.');
      return;
    }

    const newUser: StaffUser = {
      id: `u-${Date.now()}`,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      department,
      role,
      is_active: true,
    };

    setUsers([newUser, ...users]);
    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setErrorMsg('');
    showToast(`Đã thêm thành viên "${newUser.full_name}" với vai trò ${newUser.role}!`);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Super Admin</span>;
      case 'editor_in_chief':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Tổng biên tập</span>;
      case 'editor':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Biên tập viên</span>;
      case 'reporter':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Phóng viên</span>;
      case 'ads_manager':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Ads Manager</span>;
      case 'moderator':
        return <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Moderator</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Quản Lý Nhân Sự & Phân Quyền Tòa Soạn (RBAC)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Nguyên tắc đặc quyền tối thiểu (Least Privilege) bảo đảm chỉ nhân sự được ủy quyền mới có thể phê duyệt hoặc xuất bản tin bài.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg('');
            setShowAddModal(true);
          }}
          className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Thêm thành viên tòa soạn
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Nhân sự</th>
              <th className="py-3 px-4">Ban chuyên môn</th>
              <th className="py-3 px-4 text-center">Vai trò hiện tại</th>
              <th className="py-3 px-4 text-center">Đổi vai trò RBAC</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-900">{user.full_name}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{user.email}</p>
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">
                  {user.department}
                </td>
                <td className="py-3 px-4 text-center">
                  {getRoleBadge(user.role)}
                </td>
                <td className="py-3 px-4 text-center">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    disabled={user.role === 'super_admin'}
                    className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 disabled:opacity-50"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="editor_in_chief">Tổng biên tập</option>
                    <option value="editor">Biên tập viên</option>
                    <option value="reporter">Phóng viên</option>
                    <option value="ads_manager">Advertising Manager</option>
                    <option value="moderator">Moderator</option>
                    <option value="reader">Độc giả</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Hoạt động
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM THÀNH VIÊN TÒA SOẠN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#D71920] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#172033]">
                  Thêm Thành Viên Tòa Soạn Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Họ và tên nhân sự <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email tòa soạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="an.nguyen@newshub.vn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Ban chuyên môn
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                >
                  <option value="Ban Thời sự - Chính trị">Ban Thời sự - Chính trị</option>
                  <option value="Ban Kinh tế & Thị trường">Ban Kinh tế & Thị trường</option>
                  <option value="Ban Công nghệ & Số">Ban Công nghệ & Số</option>
                  <option value="Ban Xã hội & Đời sống">Ban Xã hội & Đời sống</option>
                  <option value="Ban Kiểm duyệt Độc giả">Ban Kiểm duyệt Độc giả</option>
                  <option value="Ban Quảng cáo & Doanh thu">Ban Quảng cáo & Doanh thu</option>
                  <option value="Ban Tổng Biên Tập">Ban Tổng Biên Tập</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Vai trò phân quyền RBAC
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                >
                  <option value="reporter">Phóng viên (Chỉ soạn và sửa bài của mình)</option>
                  <option value="editor">Biên tập viên (Biên tập & duyệt bài ban chuyên môn)</option>
                  <option value="editor_in_chief">Tổng biên tập (Xuất bản & duyệt toàn bộ)</option>
                  <option value="ads_manager">Advertising Manager (Quản lý chiến dịch quảng cáo)</option>
                  <option value="moderator">Moderator (Kiểm duyệt bình luận độc giả)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Tạo tài khoản & Phân quyền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
