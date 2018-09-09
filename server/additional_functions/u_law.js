function F(x, convert) {
    // Convert to RANGE
    // -1 <= x <= 1
    if (convert) {
        var OldMax = 255, OldMin = 0, NewMax = 1, NewMin = -1;
        var OldRange = parseFloat(OldMax - OldMin);
        var NewRange = parseFloat(NewMax - NewMin);
        x = parseFloat(parseFloat(parseFloat(parseFloat(x - OldMin) * NewRange) / OldRange) + NewMin);
    }

    var u = 255;
    var res = parseInt(128 * sgn(x) * Math.log(1 + (u * Math.abs(x))) / Math.log(1 + u));
    return res;
}
function iF(y) {
    // Convert to RANGE
    // -1 <= y <= 1
    y = parseFloat(parseFloat(y) / 128);

    var u = 255;
    return sgn(y) * (1 / u) * (Math.pow((1 + u), Math.abs(y)) - 1);
}
function sgn(x) {
    if (x>0) {
        return 1;
    } else if (x==0) {
        return 0;
    } else {
        return -1;
    }
}

module.exports = {F, iF};