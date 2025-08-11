<template>
  <main class="wrap">
    <header class="topbar">
      <h1>Menu Tree (SortableJS / vuedraggable)</h1>
      <div class="actions">
        <button class="btn" @click="addRoot">+ Root</button>
        <button class="btn" @click="exportFlat">Export Flat</button>
      </div>
    </header>

    <section class="meta">
      <div><strong>Nodes:</strong> {{ countNodes(treeData) }}</div>
      <div><strong>Drag group:</strong> "{{ dragGroup.name }}" (cross-level enabled)</div>
    </section>

    <!-- Root level -->
    <draggable
      v-model="treeData"
      item-key="menuId"
      :group="dragGroup"
      handle=".node__row"
      class="root"
      @change="onStructureChangeRoot"
    >
      <template #item="{ element }">
        <TreeNode
          :node="element"
          :drag-group="dragGroup"
          @add-child="onAddChild"
          @remove="onRemove"
          @structure-change="onStructureChange"
        />
      </template>

      <template #footer>
        <div class="root-empty" v-if="treeData.length === 0">
          Thả vào đây để tạo node root
        </div>
      </template>
    </draggable>

    <section class="debug">
      <details>
        <summary>Debug: Tree JSON</summary>
        <pre>{{ treeData }}</pre>
      </details>
      <details>
        <summary>Debug: Last Exported Flat JSON</summary>
        <pre>{{ lastFlat }}</pre>
      </details>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import TreeNode from '@/components/TreeNode.vue'
import {
  flatToTree,
  treeToFlat,
  genId,
  type TreeNode as TNode,
  type FlatNode
} from '@/utils/menuTree'

// ======= Sample flat từ đề bài =======
const sampleFlat: FlatNode[] = [
  {"menuId":"NODE_1","menuNm":"Node 1","menuType":"U","menuLevel":1,"menuOrder":1,"upperMenuId":null,"lastMenuYn":"N"},
  {"menuId":"NODE_2","menuNm":"Node 2","menuType":"U","menuLevel":2,"menuOrder":1,"upperMenuId":"NODE_1","lastMenuYn":"Y"},
  {"menuId":"NODE_3","menuNm":"Node 3","menuType":"U","menuLevel":2,"menuOrder":2,"upperMenuId":"NODE_1","lastMenuYn":"Y"},
  {"menuId":"NODE_4","menuNm":"Node 4","menuType":"U","menuLevel":2,"menuOrder":3,"upperMenuId":"NODE_1","lastMenuYn":"Y"},
  {"menuId":"NODE_5","menuNm":"Node 5","menuType":"U","menuLevel":1,"menuOrder":2,"upperMenuId":null,"lastMenuYn":"N"},
  {"menuId":"NODE_6","menuNm":"Node 6","menuType":"U","menuLevel":2,"menuOrder":1,"upperMenuId":"NODE_5","lastMenuYn":"Y"},
  {"menuId":"NODE_7","menuNm":"Node 7","menuType":"U","menuLevel":2,"menuOrder":2,"upperMenuId":"NODE_5","lastMenuYn":"Y"},
  {"menuId":"NODE_8","menuNm":"Node 8","menuType":"U","menuLevel":2,"menuOrder":3,"upperMenuId":"NODE_5","lastMenuYn":"Y"},
  {"menuId":"NODE_9","menuNm":"Node 9","menuType":"U","menuLevel":1,"menuOrder":3,"upperMenuId":null,"lastMenuYn":"N"},
  {"menuId":"NODE_10","menuNm":"Node 10","menuType":"U","menuLevel":2,"menuOrder":1,"upperMenuId":"NODE_9","lastMenuYn":"Y"},
  {"menuId":"NODE_11","menuNm":"Node 11","menuType":"U","menuLevel":2,"menuOrder":2,"upperMenuId":"NODE_9","lastMenuYn":"Y"},
  {"menuId":"NODE_12","menuNm":"Node 12","menuType":"U","menuLevel":2,"menuOrder":3,"upperMenuId":"NODE_9","lastMenuYn":"Y"}
]

// ======= state =======
const treeData = ref<TNode[]>(flatToTree(sampleFlat))
const lastFlat = ref<FlatNode[] | null>(null)

// group chung cho tất cả list => cho phép cross-level/cross-list
const dragGroup = { name: 'tree', pull: true, put: true }

// ======= Helpers =======
function recalcLevelsAndOrders(nodes: TNode[], parentLevel = 0, parentId: string | null = null) {
  nodes.forEach((n, idx) => {
    n.menuLevel = parentLevel + 1
    n.menuOrder = idx + 1
    n.upperMenuId = parentId
    // cập nhật lastMenuYn
    n.lastMenuYn = n.children && n.children.length ? 'N' : 'Y'
    if (n.children?.length) recalcLevelsAndOrders(n.children, n.menuLevel, n.menuId)
  })
}

function isDescendant(targetId: string, candidateParent: TNode): boolean {
  if (!candidateParent.children?.length) return false
  for (const c of candidateParent.children) {
    if (c.menuId === targetId) return true
    if (isDescendant(targetId, c)) return true
  }
  return false
}

function snapshotTree(): TNode[] {
  return JSON.parse(JSON.stringify(treeData.value))
}

function restoreTree(snapshot: TNode[]) {
  treeData.value = snapshot
}

// ======= Actions =======
function onAddChild(parent: TNode) {
  parent.children ??= []
  parent.children.push({
    menuId: genId(),
    menuNm: 'New node',
    menuType: 'U',
    menuLevel: (parent.menuLevel ?? 0) + 1,
    menuOrder: (parent.children?.length ?? 0) + 1,
    upperMenuId: parent.menuId,
    lastMenuYn: 'Y',
    children: []
  })
  onStructureChange()
}

function addRoot() {
  treeData.value.push({
    menuId: genId(),
    menuNm: 'New root',
    menuType: 'U',
    menuLevel: 1,
    menuOrder: (treeData.value.length ?? 0) + 1,
    upperMenuId: null,
    lastMenuYn: 'Y',
    children: []
  })
  onStructureChange()
}

function onRemove(node: TNode) {
  const prev = snapshotTree()
  const removeIn = (arr: TNode[]): boolean => {
    const idx = arr.findIndex(n => n.menuId === node.menuId)
    if (idx >= 0) {
      arr.splice(idx, 1)
      return true
    }
    return arr.some(n => removeIn(n.children))
  }
  removeIn(treeData.value)
  // chuẩn hoá lại sau xoá
  recalcLevelsAndOrders(treeData.value, 0, null)
  // (optional) validate sâu tối đa
  if (!validateTree(treeData.value)) {
    alert(`Vượt quá số level cho phép (${MAX_LEVEL}). Hoàn tác.`)
    restoreTree(prev)
  }
}

const MAX_LEVEL = 4
function validateTree(nodes: TNode[], level = 1): boolean {
  if (level > MAX_LEVEL) return false
  return nodes.every(n => validateTree(n.children, level + 1))
}

// gọi khi structure thay đổi ở node con
function onStructureChange() {
  recalcLevelsAndOrders(treeData.value, 0, null)
}

// gọi khi structure thay đổi tại root (có context để chặn cycle)
function onStructureChangeRoot(evt: any) {
  const prev = snapshotTree()

  // Nếu là move/add giữa các list, kiểm tra anti-cycle
  // evt có thể có { added, moved, removed } (Sortable event mirror)
  // Trường hợp kéo thành con của node X: ta kiểm đích là list của X => evt.to.__vueParentComponent.props.node (ở list con) không luôn sẵn.
  try {
    const { added, moved } = evt
    if (added?.element && added?.newIndex != null) {
      // new parent: tìm theo DOM context là khó trong SFC, nên chống cycle sau khi gắn:
      const movedNode: TNode = added.element
      // Quét toàn bộ cây, nếu bất kỳ node nào chứa movedNode như hậu duệ của chính movedNode => cycle
      const hasCycle = treeData.value.some(root => isDescendant(root.menuId, movedNode))
      if (hasCycle) {
        alert('Không thể thả vào chính hậu duệ của nó. Hoàn tác.')
        restoreTree(prev)
        return
      }
    } else if (moved?.element) {
      // reorder trong cùng list thì OK
    }
  } catch {
    // bỏ qua nếu không đủ context
  }

  recalcLevelsAndOrders(treeData.value, 0, null)
  if (!validateTree(treeData.value)) {
    alert(`Vượt quá số level cho phép (${MAX_LEVEL}). Hoàn tác.`)
    restoreTree(prev)
  }
}

function exportFlat() {
  // treeToFlat sẽ tự chuẩn hoá 1 lần nữa (an toàn khi lưu)
  lastFlat.value = treeToFlat(treeData.value)
  console.log('Exported flat', lastFlat.value)
}

function countNodes(nodes: TNode[]): number {
  let c = 0
  const dfs = (arr: TNode[]) => {
    for (const n of arr) {
      c++
      if (n.children?.length) dfs(n.children)
    }
  }
  dfs(nodes)
  return c
}
</script>

<style scoped>
.wrap { max-width: 920px; margin: 24px auto; padding: 16px; font-family: ui-sans-serif, system-ui, -apple-system; }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.actions { display: flex; gap: 8px; }
.btn { padding: 8px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 10px; }
.btn:hover { background: #f3f4f6; }
.meta { display: flex; gap: 16px; color: #4b5563; margin-bottom: 10px; }
.root { border: 2px dashed #e5e7eb; padding: 10px; border-radius: 12px; background: #fafafa; min-height: 64px; }
.root-empty { color: #6b7280; font-size: 14px; text-align: center; padding: 8px 0; }
.debug details { margin-top: 16px; }
pre { background: #0b1020; color: #d1e7ff; padding: 12px; border-radius: 10px; overflow: auto; }
</style>
