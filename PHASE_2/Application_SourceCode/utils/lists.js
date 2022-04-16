const inList = (ls, item) => {
    for (let i = 0; i < ls.length; i++) {
        if (item == ls[i]) return true;
    }
    return false;
};

const removeFromList = (ls, item) => {
    let ind = ls.indexOf(item);
    return ls.slice(0, ind++).concat(ls.slice(ind));
};

export { inList, removeFromList };
