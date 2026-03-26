# Simple Email - TODO

## Tính năng tạm ẩn (sẽ phát triển sau)

### Calendar, Tasks, Contacts
- **Trạng thái**: Đã ẩn khỏi bottom navigation (Sidebar.tsx)
- **Vị trí code**: `packages/desktop/src/components/Sidebar.tsx` - navItems array (dòng comment out)
- **Components liên quan**:
  - `CalendarView.tsx` - Giao diện lịch (month/week view)
  - `TaskList.tsx` - Quản lý task
  - `ContactList.tsx` - Danh bạ liên hệ
  - Mock data: `packages/desktop/src/lib/mock-data-phase3.ts`
- **Cách bật lại**: Uncomment 3 dòng trong `navItems` array tại `Sidebar.tsx`
