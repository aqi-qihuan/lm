import React, { useState, useEffect, useRef } from 'react'
import { Button, Input, Tag, message, Spin } from 'antd'
import { SaveOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { saveArticle, publishArticle, getArticleDetail } from '@/services/articleService'
import { getUserTags, createTag, attachTags } from '@/services/searchService'

import '@wangeditor/editor/dist/css/style.css'
const WriteArticlePage: React.FC = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [inputTag, setInputTag] = useState('')
  const [existingTags, setExistingTags] = useState<{ id: number; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [loading, setLoading] = useState(false)
  const editorRef = useRef<IDomEditor | null>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // 加载用户已有标签
  useEffect(() => {
    getUserTags().then((res) => {
      setExistingTags(res?.tag || [])
    }).catch(() => {})
  }, [])

  // 编辑模式：加载文章数据
  useEffect(() => {
    if (id) {
      fetchArticle(id)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchArticle = async (articleId: string) => {
    setLoading(true)
    try {
      const article = await getArticleDetail(Number(articleId))
      setTitle(article.title)
      setContent(article.content)
      setTags(article.tags || [])
      if (editorRef.current) {
        editorRef.current.setHtml(article.content)
      }
    } catch {
      message.error('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入文章内容...',
    onChange(editor: IDomEditor) {
      setContent(editor.getHtml())
    },
    MENU_CONF: {
      uploadImage: {
        server: '/api/upload/image',
        fieldName: 'file',
      },
    },
  }

  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: [
      'group-video',
    ],
  }

  const handleCreateEditor = (editor: IDomEditor) => {
    editorRef.current = editor
    if (content) {
      editor.setHtml(content)
    }
  }


  // 添加标签
  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag])
      setInputTag('')
    }
  }

  // 删除标签
  const handleRemoveTag = (removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag))
  }

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      message.warning('请输入文章标题')
      return
    }

    setSaving(true)
    try {
      const articleId = await saveArticle({
        title: title.trim(),
        content,
      })
      message.success('草稿保存成功！')
      if (articleId) {
        navigate(`/edit/${articleId}`)
      }
    } catch {
      message.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 发布文章
  const handlePublish = async () => {
    if (!title.trim()) {
      message.warning('请输入文章标题')
      return
    }
    if (!content.trim() || content === '<p><br></p>') {
      message.warning('请输入文章内容')
      return
    }

    setPublishing(true)
    try {
      const articleId = await publishArticle({
        title: title.trim(),
        content,
      })
      // 发布成功后附加标签
      if (tags.length > 0 && articleId) {
        try {
          // 先创建不存在的标签
          const tagIds: number[] = []
          for (const tagName of tags) {
            const existing = existingTags.find(t => t.name === tagName)
            if (existing) {
              tagIds.push(existing.id)
            } else {
              const newTag = await createTag(tagName)
              if (newTag?.tag?.id) tagIds.push(newTag.tag.id)
            }
          }
          if (tagIds.length > 0) {
            await attachTags('article', articleId, tagIds)
          }
        } catch { /* 标签附加失败不影响发布 */ }
      }
      message.success('文章发布成功！')
      navigate('/')
    } catch {
      message.error('发布失败，请重试')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between" style={{ background: 'rgba(19,21,32,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(240,192,96,0.08)', padding: '10px 12px' }}>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-600 hover:text-gold transition-colors duration-200">
            <ArrowLeftOutlined className="text-xl" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">
            {id ? '编辑文章' : '写文章'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSaveDraft}
            size="small"
            className="h-11"
            style={{ background: 'transparent', border: '1px solid rgba(240,192,96,0.3)', color: '#F0C060', borderRadius: 8 }}
          >
            <span className="hidden sm:inline">保存草稿</span>
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={publishing}
            onClick={handlePublish}
            size="small"
            className="h-11"
            style={{ background: 'linear-gradient(135deg, #F0C060, #FF8C00)', border: 'none', borderRadius: 8, fontWeight: 700, color: '#0B0D17' }}
          >
            <span className="hidden sm:inline">发布</span>
          </Button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* 标题输入 */}
        <div className="mb-6">
          <Input
            placeholder="请输入文章标题..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-xl sm:text-3xl font-bold border-none shadow-none focus:shadow-none text-gray-800"
            style={{ fontWeight: 700 }}
          />
        </div>

        {/* 标签输入 */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Input
              placeholder="添加标签"
              value={inputTag}
              onChange={e => setInputTag(e.target.value)}
              onPressEnter={handleAddTag}
              className="w-full sm:w-48"
            />
            <Button type="dashed" onClick={handleAddTag}>
              添加标签
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Tag
                key={tag}
                closable
                onClose={() => handleRemoveTag(tag)}
                style={{
                  background: 'rgba(240,192,96,0.1)',
                  border: '1px solid rgba(240,192,96,0.3)',
                  color: '#F0C060',
                  borderRadius: 16,
                }}
              >
                {tag}
              </Tag>
            ))}
          </div>
          {/* 已有标签快速选择 */}
          {existingTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span style={{ color: '#6B6558', fontSize: 12, lineHeight: '24px' }}>常用标签：</span>
              {existingTags.filter(t => !tags.includes(t.name)).slice(0, 10).map(tag => (
                <Tag
                  key={tag.id}
                  onClick={() => { if (!tags.includes(tag.name)) setTags([...tags, tag.name]) }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(240,192,96,0.15)',
                    color: '#9C9688',
                    borderRadius: 16,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  + {tag.name}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* 富文本编辑器 */}
        <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="overflow-x-auto">
            <Toolbar
              editor={editorRef.current}
              defaultConfig={toolbarConfig}
              className="border-b"
            />
          </div>
          <Editor
            defaultConfig={editorConfig}
            value={content}
            onCreated={handleCreateEditor}
            className="min-h-screen-50 p-6"
          />
        </div>
      </div>
    </div>
  )
}

export default WriteArticlePage
