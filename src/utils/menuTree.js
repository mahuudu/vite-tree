// Build tree từ flat
export function flatToTree(flat) {
    const map = new Map();
    // clone + init children
    flat.forEach(n => {
        map.set(n.menuId, { ...n, children: [] });
    });
    const roots = [];
    // gắn children theo upperMenuId
    map.forEach(node => {
        if (node.upperMenuId) {
            const parent = map.get(node.upperMenuId);
            if (parent) {
                parent.children.push(node);
            }
            else {
                // Parent không tồn tại: coi như root để không mất data
                roots.push(node);
            }
        }
        else {
            roots.push(node);
        }
    });
    // sort theo menuOrder ở mỗi cấp
    const sortByOrder = (arr) => {
        arr.sort((a, b) => a.menuOrder - b.menuOrder);
        arr.forEach(ch => sortByOrder(ch.children));
    };
    sortByOrder(roots);
    return roots;
}
// Chuẩn hoá lại menuOrder theo index ở mỗi cấp
function normalizeOrder(nodes) {
    nodes.forEach((n, i) => {
        n.menuOrder = i + 1; // 1-based
        normalizeOrder(n.children);
    });
}
// Tính level dựa theo cha
function recalcLevels(nodes, parentLevel = 0) {
    nodes.forEach(n => {
        n.menuLevel = parentLevel + 1;
        recalcLevels(n.children, n.menuLevel);
    });
}
// Xuất tree về flat theo spec (menuOrder/level/upper)
export function treeToFlat(tree) {
    // clone để không mutate dữ liệu đang binding UI
    const clone = JSON.parse(JSON.stringify(tree));
    normalizeOrder(clone);
    recalcLevels(clone, 0);
    const out = [];
    const dfs = (nodes, upper) => {
        nodes.forEach(n => {
            out.push({
                menuId: n.menuId,
                menuNm: n.menuNm,
                menuType: n.menuType ?? "U",
                menuLevel: n.menuLevel,
                menuOrder: n.menuOrder,
                upperMenuId: upper,
                // lastMenuYn: "Y" nếu không có children
                lastMenuYn: n.children && n.children.length ? "N" : "Y",
            });
            if (n.children?.length)
                dfs(n.children, n.menuId);
        });
    };
    dfs(clone, null);
    return out;
}
// Tạo id tạm cho client (bạn có thể thay bằng uuid)
export function genId(prefix = "NODE") {
    const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase();
    return `${prefix}_${ts}_${rnd}`;
}
