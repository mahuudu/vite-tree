import draggable from "vuedraggable";
const __VLS_props = defineProps({
    node: { type: Object, required: true },
    dragGroup: {
        // group chung cho toàn bộ tree để kéo qua lại các list
        type: [String, Object],
        default: () => ({ name: "tree", pull: true, put: true }),
    },
});
const __VLS_emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "node" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "node__row" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "node__label" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "node__badge" },
});
(__VLS_ctx.node.menuLevel);
// @ts-ignore
[node,];
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.node.menuNm);
// @ts-ignore
[node,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "node__id" },
});
(__VLS_ctx.node.menuId);
// @ts-ignore
[node,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "node__actions" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('add-child', __VLS_ctx.node);
            // @ts-ignore
            [node, $emit,];
        } },
    ...{ class: "btn" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('remove', __VLS_ctx.node);
            // @ts-ignore
            [node, $emit,];
        } },
    ...{ class: "btn btn--danger" },
});
const __VLS_0 = {}.draggable;
/** @type {[typeof __VLS_components.Draggable, typeof __VLS_components.draggable, typeof __VLS_components.Draggable, typeof __VLS_components.draggable, ]} */ ;
// @ts-ignore
Draggable;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.node.children),
    group: (__VLS_ctx.dragGroup),
    itemKey: "menuId",
    handle: ".node__row",
    ...{ class: "children" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.node.children),
    group: (__VLS_ctx.dragGroup),
    itemKey: "menuId",
    handle: ".node__row",
    ...{ class: "children" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: (...[$event]) => {
            __VLS_ctx.$emit('structure-change');
            // @ts-ignore
            [node, $emit, dragGroup,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
{
    const { item: __VLS_8 } = __VLS_3.slots;
    const [{ element }] = __VLS_getSlotParameters(__VLS_8);
    const __VLS_9 = {}.TreeNode;
    /** @type {[typeof __VLS_components.TreeNode, ]} */ ;
    // @ts-ignore
    TreeNode;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        ...{ 'onAddChild': {} },
        ...{ 'onRemove': {} },
        ...{ 'onStructureChange': {} },
        node: (element),
        dragGroup: (__VLS_ctx.dragGroup),
    }));
    const __VLS_11 = __VLS_10({
        ...{ 'onAddChild': {} },
        ...{ 'onRemove': {} },
        ...{ 'onStructureChange': {} },
        node: (element),
        dragGroup: (__VLS_ctx.dragGroup),
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = ({ addChild: {} },
        { onAddChild: (...[$event]) => {
                __VLS_ctx.$emit('add-child', $event);
                // @ts-ignore
                [$emit, dragGroup,];
            } });
    const __VLS_16 = ({ remove: {} },
        { onRemove: (...[$event]) => {
                __VLS_ctx.$emit('remove', $event);
                // @ts-ignore
                [$emit,];
            } });
    const __VLS_17 = ({ structureChange: {} },
        { onStructureChange: (...[$event]) => {
                __VLS_ctx.$emit('structure-change');
                // @ts-ignore
                [$emit,];
            } });
    var __VLS_12;
}
{
    const { footer: __VLS_19 } = __VLS_3.slots;
    if (!__VLS_ctx.node.children || __VLS_ctx.node.children.length === 0) {
        // @ts-ignore
        [node, node,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "empty-children" },
        });
        __VLS_asFunctionalElement(__VLS_elements.em, __VLS_elements.em)({});
        (__VLS_ctx.node.menuNm);
        // @ts-ignore
        [node,];
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['node']} */ ;
/** @type {__VLS_StyleScopedClasses['node__row']} */ ;
/** @type {__VLS_StyleScopedClasses['node__label']} */ ;
/** @type {__VLS_StyleScopedClasses['node__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['node__id']} */ ;
/** @type {__VLS_StyleScopedClasses['node__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['children']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-children']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            draggable: draggable,
        };
    },
    __typeEmits: {},
    props: {
        node: { type: Object, required: true },
        dragGroup: {
            // group chung cho toàn bộ tree để kéo qua lại các list
            type: [String, Object],
            default: () => ({ name: "tree", pull: true, put: true }),
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
    __typeEmits: {},
    props: {
        node: { type: Object, required: true },
        dragGroup: {
            // group chung cho toàn bộ tree để kéo qua lại các list
            type: [String, Object],
            default: () => ({ name: "tree", pull: true, put: true }),
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
