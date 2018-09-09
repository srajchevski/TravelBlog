var Jimp = require("jimp");

function C(x) {
    if (x == 0)
        return parseFloat(1.0/Math.sqrt(2));
    else
        return parseFloat(1.0);
}
// create 2d array
function Create2DArray(rows) {
    var arr = [];
    for (var i=0;i<rows;i++) {
        arr[i] = [];
    }
    return arr;
}
// DCT
function DCT(pixels, height, width)
{
    var block_list = [];

    for (var U = 0; U < height; U += 8)   // (*)
    {
        for (var V = 0, type = 0; V < width; V += 8, type=0) // (*) pomikanje blok po blok
        {
            // EN BLOK
            var vp8_piksli = VP8(pixels, U, V); // VP8 (samo izloci en blok)
            var dct_coef = calcDCT_coef(vp8_piksli);      // DCT
            var zz_arr = ZigZag(dct_coef);                 // ZIG-ZAG

            block_list.push(zz_arr);
        }
    }

    function VP8(pix, U, V) // vrne EN BLOK
    { // MEJE?? pix[R,C]=pix[R,C]%255
        var piksli = Create2DArray(8);
        var i,j,x,y;
        for (i = U, x = 0; i < U + 8; i++, x++) // novo matriko pisklov (en blok / 8x8)
        {
            for (j = V, y = 0; j < V + 8; j++, y++)
            {
                piksli[x][y] = pix[i][j] % 256;
            }
        }
        return piksli;
    }

    return block_list;
}

function calcDCT_coef(arr)
{
    var dct_coef = Create2DArray(8);
    var U, V;
    for (U = 0; U < 8; U++)
    {
        for (V = 0; V < 8; V++)
        {
            var sum = 0.0;
            if (U + V < 15)
            {
                var left_sum = 0.0;
                left_sum += (C(U) * C(V)) / 4;

                for (var i = 0; i < 8; i++)
                {
                    for (var j = 0; j < 8; j++)
                    {
                        if (i + j < 15) //
                        {
                            var right_sum = arr[i][j];
                            right_sum *= Math.cos(parseFloat((parseFloat((2 * i + 1) * U) * Math.PI)) / 16);
                            right_sum *= Math.cos(parseFloat((parseFloat((2 * j + 1) * V) * Math.PI)) / 16);

                            sum += right_sum;
                        }

                    }
                }
                sum *= left_sum;
            }

            dct_coef[U][V] = parseInt(Math.round(sum));
        }
    }

    return dct_coef;
}
function ZigZag(arr)
{
    var N = 7, i = 0, j = 0, cnt = 0, limit = 5000;
    var end = false;
    var res = []; // 64px + 1 VP8 TYPE!
    do
    {
        res[cnt] = parseInt(arr[i][j]);
        arr[i][j] = limit;
        if ((j > 0) && (i < N) && (arr[i + 1][j - 1] < limit)) // left-down
        {
            i++;
            j--;
        }
        else
        {

            if ((j < N) && (i > 0) && (arr[i - 1][j + 1] < limit)) // right-up
            {
                i--;
                j++;
            }
            else if ((j > 0) && (j < N)) // right (not in 1st col) 
                j++;
            else if ((i > 0) && (i < N)) // down | not in 1st row
                i++;
            else if (j < N) // right (first and last row & first col) | DC & (7,0) 
                j++;
            else
                end = true;
        }
        cnt++;
    } while (end == false);

    return res;
}

function Kodiraj(block_list)
{
    var rezultat = "";
    var num_zeros;

    for (var ind = 0, i = 1; ind < block_list.length; ind++, i = 1)
    {
        rezultat += KodirajDC(block_list[ind][0]);
        while (i < 64)
        {
            num_zeros = 0;
            while (i < 64 && block_list[ind][i] == 0)
            {
                i++;
                num_zeros++;
            }

            if (i < 64 && num_zeros > 0) // nicle + AC
            {
                rezultat += KodirajA(num_zeros, block_list[ind][i]);
                i++;
            }

            else if (i == 64) // vse do konca je 0
            {
                rezultat += KodirajB(num_zeros);
            }

            else if (i < 64) // nobena 0
            {
                rezultat += KodirajC(block_list[ind][i]);
                i++;
            }
        }
    }

    return rezultat;
}


function KodirajA(num_zeros, AC_val)
{
    // 0 (A,B), 6 biti (tek_dolz), 4 biti (ac_dolz), |ac_dolz| biti (AC)
    var res = "", AC, AC_length;
    res += "0"; //tip
    res += String("000000" + parseInt(num_zeros).toString(2)).slice(-6);

    if (AC_val > 0)
    {
        AC = parseInt(AC_val).toString(2);
        AC = "0" + AC;
        res += String("0000" + parseInt(AC.length).toString(2)).slice(-4);
        res += AC;
    }
    else
    {
        AC = parseInt(Math.abs(AC_val)).toString(2);
        AC = "1" + AC;
        res += String("0000" + parseInt(AC.length).toString(2)).slice(-4);
        res += AC;
    }

    return res;
}
function KodirajB(num_zeros)
{
    // 0 (A,B), 6 biti (tek_dolz)
    var res = "";
    res += "0"; //tip
    res += String("000000" + parseInt(num_zeros).toString(2)).slice(-6);

    return res;
}
function KodirajC(AC_val)
{
    // 1 (C), 4 biti (ac_dolz), ac_dolz biti (AC)
    var res = "", AC, AC_length;
    res += "1"; //tip

    if (AC_val > 0)
    {
        AC = parseInt(AC_val).toString(2);
        AC = "0" + AC;
        res += String("0000" + parseInt(AC.length).toString(2)).slice(-4);
        res += AC;
    }
    else
    {
        AC = parseInt(Math.abs(AC_val)).toString(2);
        AC = "1" + AC;
        res += String("0000" + parseInt(AC.length).toString(2)).slice(-4);
        res += AC;
    }

    return res;
}
function KodirajDC(DC)
{
    if (DC >= 0)    // dodamo 0 do ustrezno dolzino
    {
        return String("000000000000" + parseInt(DC).toString(2)).slice(-12);
    }
    else            //
    {
        var res = String("000000000000" + parseInt(Math.abs(DC)).toString(2)).slice(-11);
        res = "1" + res;
        return res;
    }
}
function decodePixels (bit_string, bit_index, blocks_size, blocks_w_size) {
    var res = [], zz_piksli = [];
    var blocks_num = 0, blocks_h = 0, blocks_w = 0, num_coef = 0;

    while (blocks_num < blocks_size) {
        if (num_coef == 0) // zacetek bloka -> DC
        {
            var neg = bit_string.substring(bit_index, bit_index+1);
            bit_index += 1;
            var DC = parseInt(bit_string.substring(bit_index, bit_index+11), 2);
            bit_index += 11;

            if (neg=="1")
            {
                DC *= -1;
            }
            zz_piksli[num_coef] = DC;
            num_coef += 1;
        }

        var code_type = bit_string.substring(bit_index, bit_index+1);
        bit_index += 1;
        if (code_type == "0") // A / B
        {
            var tek_dolz = parseInt(bit_string.substring(bit_index, bit_index+6), 2); // 6biti tek_dolz
            bit_index += 6;
            for (var x = 0; x < tek_dolz; x++)
            {
                zz_piksli[num_coef] = 0;
                num_coef += 1;
            }

            if (num_coef != 64) // A
            {
                var AC_length = parseInt(bit_string.substring(bit_index, bit_index+4), 2);  // 4biti dolzina
                bit_index += 4;

                var neg = bit_string.substring(bit_index, bit_index+1);
                bit_index += 1;
                var AC = parseInt(bit_string.substring(bit_index, bit_index+(AC_length-1)), 2); // |dolzina-1|biti AC
                bit_index += AC_length-1;

                if (neg == "1")
                {
                    AC *= -1;
                }
                zz_piksli[num_coef] = AC;
                num_coef += 1;
            }
        }
        else if (code_type == "1") // C
        {
            var AC_length = parseInt(bit_string.substring(bit_index, bit_index+4), 2);  // 4biti dolzina
            bit_index += 4;

            var neg = bit_string.substring(bit_index, bit_index+1);
            bit_index += 1;
            var AC = parseInt(bit_string.substring(bit_index, bit_index+(AC_length-1)), 2); // |dolzina-1|biti AC
            bit_index += AC_length - 1;

            if (neg == "1")
            {
                AC *= -1;
            }
            zz_piksli[num_coef] = AC;
            num_coef += 1;
        }


        if (num_coef == 64) // KONEC BLOKA, zacetek novega
        {
            console.log("Block #"+blocks_num+" done!");
            // iZIGZAG
            //var pixs = iZigZag(zz_piksli);
            // iDCT
            //pixs = iDCT(pixs);


            res.push(zz_piksli);
            // RESET VALUES
            num_coef = 0;
            blocks_num += 1;
            blocks_w += 1;
            zz_piksli = [];

            if (blocks_w == blocks_w_size) // konec vrstice (koncni stolpec)
            {
                blocks_w = 0;
                blocks_h += 1;
            }
        }
    }

    return res;
}

module.exports = {C, Create2DArray, Kodiraj, DCT, decodePixels};