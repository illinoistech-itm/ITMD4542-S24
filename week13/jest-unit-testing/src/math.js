function sum(...nums) {
    return nums.reduce((acc, val) => {
        if (typeof val !== 'number') {
            throw new Error('Inputs should be numbers!');
        }
        return acc + val;
    });
}

function gt(a, b) {
    if (a > b) {
        return true;
    } else {
        return false;
    }
}

function divide(a, b) {
    return b === 0 ? NaN : a / b;
}

function addString(a, b) {
    return `${a} ${b}`;
}

module.exports = {
    sum,
    gt,
    divide, 
    addString
}; 