const CANVAS_SIZE = 280;
const CANVAS_SCALE = 0.1;
const INFERENCE_SIZE = 28;

let options = { willReadFrequently: true };
const canvas = document.getElementById("canvas");
const hiddenCanvas = document.getElementById("hiddenCanvas");
const loading = document.getElementById("loading");
const ctx = canvas.getContext("2d", options);
const hiddenCanvasCtx = hiddenCanvas.getContext("2d", options);
const rect = canvas.getBoundingClientRect();
hiddenCanvasCtx.scale(CANVAS_SCALE, CANVAS_SCALE);


const reset_button = document.getElementById("right-half");
const clear_button = document.getElementById("clear");
const save_button = document.getElementById("save");


ctx.lineWidth = 13;
ctx.lineCap = 'round'
ctx.lineJoin = "round";
ctx.strokeStyle = "#000000"

const hasTouchEvent = 'ontouchstart' in window ? true : false;

let isMouseActive = false;
let x1 = 0;
let y1 = 0;
let x2 = 0;
let y2 = 0;


let password ;
let min = 0;
let max = 10;
let count = 0;
var submit =[];


const sess = new onnx.InferenceSession();
const loadingModelPromise = sess.loadModel("./onnx_model.onnx");

async function updatePredictions() {
    // Get the predictions for the canvas data.
    hiddenCanvasCtx.drawImage(canvas, 0, 0);
    const hiddenImgData = hiddenCanvasCtx.getImageData(0, 0, INFERENCE_SIZE, INFERENCE_SIZE);
    var data = hiddenImgData.data;
    var gray_data = [];

    for (var i = 3; i < data.length; i += 4) {
        pix = data[i] / 255;
        pix = (pix - 0.1307) / 0.3081
        gray_data.push(pix);
    }

    const input = new onnx.Tensor(new Float32Array(gray_data), "float32", [1, 1, INFERENCE_SIZE, INFERENCE_SIZE]);

    const outputMap = await sess.run([input]);
    const outputTensor = outputMap.values().next().value;
    const predictions = softmax(outputTensor.data);
    const maxPrediction = Math.max(...predictions);
    const predictLabel = predictions.findIndex((n) => n == maxPrediction);

    console.log(predictLabel);
    pre_answer=parseInt(predictLabel);
    $("#now").html(predictLabel);
}

function softmax(arr) {
    return arr.map(function (value, index) {
        return Math.exp(value) / arr.map(function (y /*value*/) { return Math.exp(y) }).reduce(function (a, b) { return a + b })
    })
}

function clearArea() {
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    hiddenCanvasCtx.setTransform(CANVAS_SCALE, 0, 0, CANVAS_SCALE, 0, 0);
    hiddenCanvasCtx.clearRect(0, 0, hiddenCanvasCtx.canvas.width / CANVAS_SCALE, hiddenCanvasCtx.canvas.height / CANVAS_SCALE);
}


function getPos(x, y) {
    return {
        x: Math.round((x - rect.left) / (rect.right - rect.left) * canvas.width),
        y: Math.round((y - rect.top) / (rect.bottom - rect.top) * canvas.height)
    }
}

// Prevent scrolling when touching the canvas
function touchStart(e) {
    if (e.target == canvas) {
        e.preventDefault();
        isMouseActive = true;
        if (hasTouchEvent) {
            var pos = getPos(e.touches[0].clientX, e.touches[0].clientY);
        }
        else {
            var pos = getPos(e.clientX, e.clientY);
        }
        x1 = pos.x;
        y1 = pos.y;
    }
}

function touchEnd(e) {
    if (e.target == canvas) {
        isMouseActive = false;
    }
    
}

function touchMove(e) {
    if (e.target == canvas) {
        e.preventDefault();

        if (!isMouseActive) {
            return
        }
        if (hasTouchEvent) {
            var pos = getPos(e.touches[0].clientX, e.touches[0].clientY);
        }
        else {
            var pos = getPos(e.clientX, e.clientY);
        }
        x2 = pos.x;
        y2 = pos.y;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        x1 = x2;
        y1 = y2;

        updatePredictions();
    }
}

document.body.addEventListener("mouseout", function (e) {
    if (!e.relatedTarget || e.relatedTarget.nodeName === "HTML") {
        isMouseDown = false;
    }
});

loadingModelPromise.then(() => {
    console.log("Successfully loaded model.");

    save_button.addEventListener("mouseenter",save_enter, {passive: true});
    save_button.addEventListener("mouseout",save_leave, {passive: true});

    clear_button.addEventListener("mouseenter",clear_enter, {passive: true});
    clear_button.addEventListener("mouseout",clear_leave, {passive: true});

    password = Math.round(Math.random()*8)+1;
    console.log("password : "+password);

    reset_button.addEventListener("click",reset, { passive: false});
    save_button.addEventListener("click",save, { passive: false});
    clear_button.addEventListener("click",clearArea, { passive: false});
    

    
    if (hasTouchEvent) {
        document.body.addEventListener("touchstart", touchStart, { passive: false });
        document.body.addEventListener("touchmove", touchMove, { passive: false });
        document.body.addEventListener("touchend", touchEnd, { passive: false });
    }
    else {
        canvas.addEventListener("mousedown", touchStart);
        canvas.addEventListener("mousemove", touchMove);
        canvas.addEventListener("mouseup", touchEnd);
        }

})

function reset(e){
    min = 0;
    max = 10;
    count = 0;
    password = Math.round(Math.random()*8)+1;
    console.log("password : "+password);
    $("#reset").html("reset");
    $("#answer1").html("answer1");
    $("#answer2").html("answer2");
    $("#answer3").html("answer3");
    $("#now").html("");
    $("#Title").css('background','#013D60');
    $("#canvas").css('background','#dddee0');
    $("#answer1").css('background','#0E5E8B');
    $("#answer2").css('background','#70C0ED');
    $("#answer3").css('background','#D1ECFC');
    $("#right-half").css('background','#013D60');
    $(".right").css('background', '#013D60');

    $("#canvas").css('display','block');
    $("#rule").css('display','block');
    $(".button_photo").css('display','block');
    $("#now").css('display','block');
    $(".tenor-gif-embed").css('display','none');

    clearArea();
}

function save(e){
    console.log(pre_answer);
    submit[count] = pre_answer;
    if (pre_answer>min && pre_answer<max){
        $("#now").html();
        if (count>=2 && pre_answer!=password){
            $("#answer"+(count+1)).html("answer : "+pre_answer);
            loss();
            
        }
        else if(count<=2 && pre_answer==password){
            $("#answer"+(count+1)).html("answer : "+pre_answer);
            win();
        }
        else{
            if (pre_answer>password){
                max = pre_answer;
                $("#answer"+(count+1)).html(min+"~"+max);
            }
            else if(pre_answer< password){
                min = pre_answer;
                $("#answer"+(count+1)).html(min+"~"+max);
            }
            else{
                $("#answer"+(count+1)).html(pre_answer);
            }
        }
        
        console.log(submit[count]);
        console.log("#answer"+count);
        console.log(submit[count]);
        count++;
    }
    
    else{
        alert("write the number between"+min+"~"+max);
    }
    clearArea();    
}

function loss(){
    $("#Title").css('background', '#600101');
    $("#canvas").css('background','#000000');
    $("#canvas").css('display','none');
    $("#rule").css('display','none');
    $(".button_photo").css('display','none');
    $("#now").css('display','none');
    $("#lossphoto").css('display','block');
    $("#answer1").css('background','#A81818');
    $("#answer2").css('background','#ED7070');
    $("#answer3").css('background','#F0DFDF');
    $("#answer3").html(password);
    $("#right-half").css('background','#600101');
    $(".right").css('background', '#600101');
}

function win(){
    $("#Title").css('background', '#866206');
    $("#canvas").css('background','#000000');
    $("#answer1").css('background','#C9940B');
    $("#answer2").css('background','#E5B947');
    $("#answer3").css('background','#E5C87D');
    $("#right-half").css('background','#6B4306');
    $(".right").css('background', '#6B4306');
    $("#canvas").css('display','none');
    $("#rule").css('display','none');
    $(".button_photo").css('display','none');
    $("#now").css('display','none');
    $("#winphoto").css('display','block');
}

function save_enter(e){
    $("#save").css('background-color', '#e9e9e9');
}
function save_leave(e){
    $("#save").css('background-color', '#696969');
}

function clear_enter(e){
    $("#clear").css('background-color', '#e9e9e9');
}
function clear_leave(e){
    $("#clear").css('background-color', '#696969');
}



