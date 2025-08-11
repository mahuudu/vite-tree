import { ref } from 'vue';
import draggable from 'vuedraggable';
import TreeNode from './components/TreeNode.vue';
import { flatToTree, treeToFlat, genId } from '@/utils/menuTree';
// ======= Sample flat từ đề bài =======
const sampleFlat = [
    { "menuId": "NODE_1", "menuNm": "Node 1", "menuType": "U", "menuLevel": 1, "menuOrder": 1, "upperMenuId": null, "lastMenuYn": "N" },
    { "menuId": "NODE_2", "menuNm": "Node 2", "menuType": "U", "menuLevel": 2, "menuOrder": 1, "upperMenuId": "NODE_1", "lastMenuYn": "Y" },
    { "menuId": "NODE_3", "menuNm": "Node 3", "menuType": "U", "menuLevel": 2, "menuOrder": 2, "upperMenuId": "NODE_1", "lastMenuYn": "Y" },
    { "menuId": "NODE_4", "menuNm": "Node 4", "menuType": "U", "menuLevel": 2, "menuOrder": 3, "upperMenuId": "NODE_1", "lastMenuYn": "Y" },
    { "menuId": "NODE_5", "menuNm": "Node 5", "menuType": "U", "menuLevel": 1, "menuOrder": 2, "upperMenuId": null, "lastMenuYn": "N" },
    { "menuId": "NODE_6", "menuNm": "Node 6", "menuType": "U", "menuLevel": 2, "menuOrder": 1, "upperMenuId": "NODE_5", "lastMenuYn": "Y" },
    { "menuId": "NODE_7", "menuNm": "Node 7", "menuType": "U", "menuLevel": 2, "menuOrder": 2, "upperMenuId": "NODE_5", "lastMenuYn": "Y" },
    { "menuId": "NODE_8", "menuNm": "Node 8", "menuType": "U", "menuLevel": 2, "menuOrder": 3, "upperMenuId": "NODE_5", "lastMenuYn": "Y" },
    { "menuId": "NODE_9", "menuNm": "Node 9", "menuType": "U", "menuLevel": 1, "menuOrder": 3, "upperMenuId": null, "lastMenuYn": "N" },
    { "menuId": "NODE_10", "menuNm": "Node 10", "menuType": "U", "menuLevel": 2, "menuOrder": 1, "upperMenuId": "NODE_9", "lastMenuYn": "Y" },
    { "menuId": "NODE_11", "menuNm": "Node 11", "menuType": "U", "menuLevel": 2, "menuOrder": 2, "upperMenuId": "NODE_9", "lastMenuYn": "Y" },
    { "menuId": "NODE_12", "menuNm": "Node 12", "menuType": "U", "menuLevel": 2, "menuOrder": 3, "upperMenuId": "NODE_9", "lastMenuYn": "Y" }
];
// ======= state =======
const treeData = ref(flatToTree(sampleFlat));
const lastFlat = ref(null);
// group chung cho tất cả list => cho phép cross-level/cross-list
const dragGroup = { name: 'tree', pull: true, put: true };
// ======= Helpers =======
function recalcLevelsAndOrders(nodes, parentLevel = 0, parentId = null) {
    nodes.forEach((n, idx) => {
        n.menuLevel = parentLevel + 1;
        n.menuOrder = idx + 1;
        n.upperMenuId = parentId;
        // cập nhật lastMenuYn
        n.lastMenuYn = n.children && n.children.length ? 'N' : 'Y';
        if (n.children?.length)
            recalcLevelsAndOrders(n.children, n.menuLevel, n.menuId);
    });
}
function isDescendant(targetId, candidateParent) {
    if (!candidateParent.children?.length)
        return false;
    for (const c of candidateParent.children) {
        if (c.menuId === targetId)
            return true;
        if (isDescendant(targetId, c))
            return true;
    }
    return false;
}
function snapshotTree() {
    return JSON.parse(JSON.stringify(treeData.value));
}
function restoreTree(snapshot) {
    treeData.value = snapshot;
}
// ======= Actions =======
function onAddChild(parent) {
    parent.children ?? (parent.children = []);
    parent.children.push({
        menuId: genId(),
        menuNm: 'New node',
        menuType: 'U',
        menuLevel: (parent.menuLevel ?? 0) + 1,
        menuOrder: (parent.children?.length ?? 0) + 1,
        upperMenuId: parent.menuId,
        lastMenuYn: 'Y',
        children: []
    });
    onStructureChange();
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
    });
    onStructureChange();
}
function onRemove(node) {
    const prev = snapshotTree();
    const removeIn = (arr) => {
        const idx = arr.findIndex(n => n.menuId === node.menuId);
        if (idx >= 0) {
            arr.splice(idx, 1);
            return true;
        }
        return arr.some(n => removeIn(n.children));
    };
    removeIn(treeData.value);
    // chuẩn hoá lại sau xoá
    recalcLevelsAndOrders(treeData.value, 0, null);
    // (optional) validate sâu tối đa
    if (!validateTree(treeData.value)) {
        alert(`Vượt quá số level cho phép (${MAX_LEVEL}). Hoàn tác.`);
        restoreTree(prev);
    }
}
const MAX_LEVEL = 4;
function validateTree(nodes, level = 1) {
    if (level > MAX_LEVEL)
        return false;
    return nodes.every(n => validateTree(n.children, level + 1));
}
// gọi khi structure thay đổi ở node con
function onStructureChange() {
    recalcLevelsAndOrders(treeData.value, 0, null);
}
// gọi khi structure thay đổi tại root (có context để chặn cycle)
function onStructureChangeRoot(evt) {
    const prev = snapshotTree();
    // Nếu là move/add giữa các list, kiểm tra anti-cycle
    // evt có thể có { added, moved, removed } (Sortable event mirror)
    // Trường hợp kéo thành con của node X: ta kiểm đích là list của X => evt.to.__vueParentComponent.props.node (ở list con) không luôn sẵn.
    try {
        const { added, moved } = evt;
        if (added?.element && added?.newIndex != null) {
            // new parent: tìm theo DOM context là khó trong SFC, nên chống cycle sau khi gắn:
            const movedNode = added.element;
            // Quét toàn bộ cây, nếu bất kỳ node nào chứa movedNode như hậu duệ của chính movedNode => cycle
            const hasCycle = treeData.value.some(root => isDescendant(root.menuId, movedNode));
            if (hasCycle) {
                alert('Không thể thả vào chính hậu duệ của nó. Hoàn tác.');
                restoreTree(prev);
                return;
            }
        }
        else if (moved?.element) {
            // reorder trong cùng list thì OK
        }
    }
    catch {
        // bỏ qua nếu không đủ context
    }
    recalcLevelsAndOrders(treeData.value, 0, null);
    if (!validateTree(treeData.value)) {
        alert(`Vượt quá số level cho phép (${MAX_LEVEL}). Hoàn tác.`);
        restoreTree(prev);
    }
}
function exportFlat() {
    // treeToFlat sẽ tự chuẩn hoá 1 lần nữa (an toàn khi lưu)
    lastFlat.value = treeToFlat(treeData.value);
    console.log('Exported flat', lastFlat.value);
}
function countNodes(nodes) {
    let c = 0;
    const dfs = (arr) => {
        for (const n of arr) {
            c++;
            if (n.children?.length)
                dfs(n.children);
        }
    };
    dfs(nodes);
    return c;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "wrap" },
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "topbar" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.addRoot) },
    ...{ class: "btn" },
});
// @ts-ignore
[addRoot,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.exportFlat) },
    ...{ class: "btn" },
});
// @ts-ignore
[exportFlat,];
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "meta" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.countNodes(__VLS_ctx.treeData));
// @ts-ignore
[countNodes, treeData,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.dragGroup.name);
// @ts-ignore
[dragGroup,];
const __VLS_0 = {}.draggable;
/** @type {[typeof __VLS_components.Draggable, typeof __VLS_components.draggable, typeof __VLS_components.Draggable, typeof __VLS_components.draggable, ]} */ ;
// @ts-ignore
Draggable;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.treeData),
    itemKey: "menuId",
    group: (__VLS_ctx.dragGroup),
    handle: ".node__row",
    ...{ class: "root" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.treeData),
    itemKey: "menuId",
    group: (__VLS_ctx.dragGroup),
    handle: ".node__row",
    ...{ class: "root" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: (__VLS_ctx.onStructureChangeRoot) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[treeData, dragGroup, onStructureChangeRoot,];
{
    const { item: __VLS_8 } = __VLS_3.slots;
    const [{ element }] = __VLS_getSlotParameters(__VLS_8);
    /** @type {[typeof TreeNode, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(TreeNode, new TreeNode({
        ...{ 'onAddChild': {} },
        ...{ 'onRemove': {} },
        ...{ 'onStructureChange': {} },
        node: (element),
        dragGroup: (__VLS_ctx.dragGroup),
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onAddChild': {} },
        ...{ 'onRemove': {} },
        ...{ 'onStructureChange': {} },
        node: (element),
        dragGroup: (__VLS_ctx.dragGroup),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    const __VLS_14 = ({ addChild: {} },
        { onAddChild: (__VLS_ctx.onAddChild) });
    const __VLS_15 = ({ remove: {} },
        { onRemove: (__VLS_ctx.onRemove) });
    const __VLS_16 = ({ structureChange: {} },
        { onStructureChange: (__VLS_ctx.onStructureChange) });
    // @ts-ignore
    [dragGroup, onAddChild, onRemove, onStructureChange,];
    var __VLS_11;
}
{
    const { footer: __VLS_18 } = __VLS_3.slots;
    if (__VLS_ctx.treeData.length === 0) {
        // @ts-ignore
        [treeData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "root-empty" },
        });
    }
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "debug" },
});
__VLS_asFunctionalElement(__VLS_elements.details, __VLS_elements.details)({});
__VLS_asFunctionalElement(__VLS_elements.summary, __VLS_elements.summary)({});
__VLS_asFunctionalElement(__VLS_elements.pre, __VLS_elements.pre)({});
(__VLS_ctx.treeData);
// @ts-ignore
[treeData,];
__VLS_asFunctionalElement(__VLS_elements.details, __VLS_elements.details)({});
__VLS_asFunctionalElement(__VLS_elements.summary, __VLS_elements.summary)({});
__VLS_asFunctionalElement(__VLS_elements.pre, __VLS_elements.pre)({});
(__VLS_ctx.lastFlat);
// @ts-ignore
[lastFlat,];
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['meta']} */ ;
/** @type {__VLS_StyleScopedClasses['root']} */ ;
/** @type {__VLS_StyleScopedClasses['root-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['debug']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            draggable: draggable,
            TreeNode: TreeNode,
            treeData: treeData,
            lastFlat: lastFlat,
            dragGroup: dragGroup,
            onAddChild: onAddChild,
            addRoot: addRoot,
            onRemove: onRemove,
            onStructureChange: onStructureChange,
            onStructureChangeRoot: onStructureChangeRoot,
            exportFlat: exportFlat,
            countNodes: countNodes,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */
