// 优化版本的删除函数（在数据库级联删除修复后可以使用）
const handleDelete = async () => {
  if (!confirm('确定要删除这个申请吗？此操作无法撤销。')) return

  setLoading(true)
  try {
    // 如果数据库设置了CASCADE删除，这个操作会自动删除关联的requirements
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', application.id)

    if (error) throw error
    onDelete(application.id)
  } catch (error) {
    console.error('Error deleting application:', error)
    alert('删除申请时出错，请重试')
  } finally {
    setLoading(false)
  }
}