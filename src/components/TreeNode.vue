<template>
  <div class="node">
    <div class="node__row">
      <div class="node__label">
        <span class="node__badge">L{{ node.menuLevel }}</span>
        <strong>{{ node.menuNm }}</strong>
        <span class="node__id">({{ node.menuId }})</span>
      </div>

      <div class="node__actions">
        <button class="btn" @click="$emit('add-child', node)">+ Child</button>
        <button class="btn btn--danger" @click="$emit('remove', node)">
          Delete
        </button>
      </div>
    </div>

    <!-- List con có thể thả vào -->
    <draggable
      v-model="node.children"
      :group="dragGroup"
      item-key="menuId"
      handle=".node__row"
      @change="$emit('structure-change')"
      class="children"
    >
      <template #item="{ element }">
        <TreeNode
          :node="element"
          :drag-group="dragGroup"
          @add-child="$emit('add-child', $event)"
          @remove="$emit('remove', $event)"
          @structure-change="$emit('structure-change')"
        />
      </template>

      <template #footer>
        <div
          class="empty-children"
          v-if="!node.children || node.children.length === 0"
        >
          Thả vào đây để tạo con của <em>{{ node.menuNm }}</em>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import draggable from "vuedraggable";
import type { TreeNode } from "@/utils/menuTree";

defineProps({
  node: { type: Object as PropType<TreeNode>, required: true },
  dragGroup: {
    // group chung cho toàn bộ tree để kéo qua lại các list
    type: [String, Object] as PropType<any>,
    default: () => ({ name: "tree", pull: true, put: true }),
  },
});

defineEmits<{
  (e: "add-child", node: TreeNode): void;
  (e: "remove", node: TreeNode): void;
  (e: "structure-change"): void;
}>();
</script>

<style scoped>
.node {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 8px 8px 4px;
  margin: 6px 0;
  background: #fff;
}
.node__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: grab;
  background: #f9fafb;
}
.node__label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.node__badge {
  font-size: 12px;
  background: #eef2ff;
  color: #3730a3;
  padding: 2px 6px;
  border-radius: 999px;
}
.node__id {
  color: #888;
  font-size: 12px;
}
.node__actions {
  display: flex;
  gap: 6px;
}
.btn {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
}
.btn:hover {
  background: #f3f4f6;
}
.btn--danger {
  color: #b91c1c;
  border-color: #fecaca;
}
.children {
  margin-left: 18px;
  padding-left: 12px;
  border-left: 2px dashed #e5e7eb;
}
.empty-children {
  font-size: 12px;
  color: #6b7280;
  padding: 6px 0 2px;
}
</style>
