function start_canvas() {
    var canvas = document.getElementById("clock-canvas");
    var context = canvas.getContext("2d");

    canvas.setAttribute("height", 1300);
    canvas.setAttribute("width", 2500);

    draw_clocks(canvas, context); 

    window.requestAnimationFrame(start_canvas);
}


function draw_clocks(canvas, context) {
    var time = new Date();
    
    angles = angle_array(time, 3);
    
    var d = canvas.width / angles[0].length;
    var x_space = d / 2;
    var y_space = (canvas.height - d*angles.length) / 2 + d/2;
    
    for(var i=0; i < angles.length; i++) {
        for(var j=0; j < angles[0].length; j++) {
            var angle1 = angles[i][j][0];
            var angle2 = angles[i][j][1];
            var x = x_space + j*d;
            var y = y_space + i*d;
            draw_clock(context, x, y, d/2, angle1, angle2);
        }
    }
}

function draw_clock(context, cx, cy, radius, angle1, angle2) {
    angle1 *= Math.PI/180;
    angle2 *= Math.PI/180;

    context.strokeStyle = "#3f3f3f";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(cx, cy, radius, 0, 2*Math.PI);
    context.stroke()
    context.strokeStyle = "#f0f0f0";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(cx + radius*Math.cos(angle1), cy + radius*Math.sin(angle1));
    context.moveTo(cx, cy);
    context.lineTo(cx + radius*Math.cos(angle2), cy + radius*Math.sin(angle2));
    context.stroke();
}

function angle_array(time1, dt) {

    time2 = new Date(time1.getTime() + 1000 * dt);

    var h1 = time1.getHours();
    var h2 = time2.getHours();
    var m1 = time1.getMinutes();
    var m2 = time2.getMinutes();
    var s1 = time1.getSeconds() + time1.getMilliseconds()/1000;

    // Separate time into [hr_dig_1, hr_dig_2, sec_dig_1, sec_dig_2]
    var t1 = [Math.floor(h1/10), h1 % 10, Math.floor(m1/10), m1 % 10];
    var t2 = [Math.floor(h2/10), h2 % 10, Math.floor(m2/10), m2 % 10];
    
    // These are the interpolation values to use for each digit in t1/t2
    if(t1[0] != t2[0]) {
        var trans1 = 1 - (60*(((t1[0] < 2) ? 10 : 4) - h1)*(60 - m1) - s1)/dt;
    }
    else {
        var trans1 = 0;
    }
    if(t1[1] != t2[1]) {
        var trans2 = 1 - (60*(60 - m1) - s1)/dt;
    }
    else {
        var trans2 = 0;
    }
    if(t1[2] != t2[2]) {
        var trans3 = 1 - (60*(10 - m1 % 10) - s1)/dt;
    }
    else {
        var trans3 = 0;
    }
    if(t1[3] != t2[3]) {
        var trans4 = 1 - (60-s1)/dt;
    }
    else {
        var trans4 = 0;
    }
    var v_lerp = [trans1, trans2, trans3, trans4];
    
    var angles = [[], [], [], [], [], []];
    for(var i=0; i < angles.length; i++) {
        for(var j=0; j < t1.length; j++) {
            var l_angles = transition(v_lerp[j], digit(t1[j]), digit(t2[j]));
            angles[i] = angles[i].concat(l_angles[i]);
        }
    }
    
    return angles;
}

function transition(v_lerp, digit1, digit2) {
    // Short circuit this function
    if(v_lerp == 0) {
        return digit1;
    }
    else if(v_lerp == 1) {
        return digit2;
    }
    
    // Perform a linear interpolation between the angles in digit1 and
    // digit2 by the amount specified in v_lerp
    var out = JSON.parse(JSON.stringify(digit1));
    for(var i=0; i < digit1.length; i++) {
        for(var j=0; j < digit1[0].length; j++) {
            for(var k=0; k < digit1[0][0].length; k++) {
                var a = digit1[i][j][k];
                var b = digit2[i][j][k];
                // Force clockwise rotation
                if(b < a) {
                    b += 360;
                }
                out[i][j][k] = a + v_lerp * (b - a);
            }
        }
    }
    return out;
}

function digit(num) {
    // Only integer inputs allowed as num
    switch(num) {
        case 0:
            return [[state(0), state(1), state(1), state(2)],
                    [state(3), state(0), state(2), state(3)],
                    [state(3), state(3), state(3), state(3)],
                    [state(3), state(3), state(3), state(3)],
                    [state(3), state(5), state(4), state(3)],
                    [state(5), state(1), state(1), state(4)]];
        case 1:
            return [[state(0), state(1), state(2), state(-1)],
                    [state(5), state(2), state(3), state(-1)],
                    [state(-1), state(3), state(3), state(-1)],
                    [state(-1), state(3), state(3), state(-1)],
                    [state(0), state(4), state(5), state(2)],
                    [state(5), state(1), state(1), state(4)]];
        case 2:
            return [[state(0), state(1), state(1), state(2)],
                    [state(5), state(1), state(2), state(3)],
                    [state(0), state(1), state(4), state(3)],
                    [state(3), state(0), state(1), state(4)],
                    [state(3), state(5), state(1), state(2)],
                    [state(5), state(1), state(1), state(4)]];
        case 3:
            return [[state(0), state(1), state(1), state(2)],
                    [state(5), state(1), state(2), state(3)],
                    [state(0), state(1), state(4), state(3)],
                    [state(5), state(1), state(2), state(3)],
                    [state(0), state(1), state(4), state(3)],
                    [state(5), state(1), state(1), state(4)]];
        case 4:
            return [[state(0), state(2), state(0), state(2)],
                    [state(3), state(3), state(3), state(3)],
                    [state(3), state(5), state(4), state(3)],
                    [state(5), state(1), state(2), state(3)],
                    [state(-1), state(-1), state(3), state(3)],
                    [state(-1), state(-1), state(5), state(4)]];
        case 5:
            return [[state(0), state(1), state(1), state(2)],
                    [state(3), state(0), state(1), state(4)],
                    [state(3), state(5), state(1), state(2)],
                    [state(5), state(1), state(2), state(3)],
                    [state(0), state(1), state(4), state(3)],
                    [state(5), state(1), state(1), state(4)]];
        case 6:
            return [[state(0), state(1), state(1), state(2)],
                    [state(3), state(0), state(1), state(4)],
                    [state(3), state(5), state(1), state(2)],
                    [state(3), state(0), state(2), state(3)],
                    [state(3), state(5), state(4), state(3)],
                    [state(5), state(1), state(1), state(4)]];
        case 7:
            return [[state(0), state(1), state(1), state(2)],
                    [state(5), state(1), state(2), state(3)],
                    [state(-1), state(-1), state(3), state(3)],
                    [state(-1), state(-1), state(3), state(3)],
                    [state(-1), state(-1), state(3), state(3)],
                    [state(-1), state(-1), state(5), state(4)]];
        case 8:
            return [[state(0), state(1), state(1), state(2)],
                    [state(3), state(0), state(2), state(3)],
                    [state(3), state(5), state(4), state(3)],
                    [state(3), state(0), state(2), state(3)],
                    [state(3), state(5), state(4), state(3)],
                    [state(5), state(1), state(1), state(4)]];
        case 9:
            return [[state(0), state(1), state(1), state(2)],
                    [state(3), state(0), state(2), state(3)],
                    [state(3), state(5), state(4), state(3)],
                    [state(5), state(1), state(2), state(3)],
                    [state(0), state(1), state(4), state(3)],
                    [state(5), state(1), state(1), state(4)]];
        default:
            return []
    }
}

function state(num) {
    // State is 0-5 with anything else being the null state (we use -1)
    switch(num) {
        case 0:
            // Top-left corner
            return [0, 90];
        case 1:
            // Horizontal line
            return [0, 180];
        case 2:
            // Top-right corner
            return [90, 180];
        case 3:
            // Vertical line
            return [90, 270];
        case 4:
            // Bottom-right corner
            return [180, 270];
        case 5:
            // Bottom-left corner
            return [0, 270];
        default:
            // Point at 135 degrees
            return [135, 135];
    }
}