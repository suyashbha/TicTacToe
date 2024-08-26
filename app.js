let resetbtn = document.querySelector(".reset");
let boxes = document.querySelectorAll(".btn");
let message = document.querySelector(".msg");
let container = document.querySelector(".win");
let newGame = document.querySelector(".new");

const winPattern =[
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

let turnX =true;

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if(turnX)
        {
            box.innerText="X";
            turnX = false;
        }
        else{
            box.innerText="O";
            turnX = true;
        }
        box.disabled = true;
        checkWinner();
    })
});

function checkWinner(){
    for(let pattern of winPattern )
    {
        let val1= boxes[pattern[0]].innerText;
        let val2= boxes[pattern[1]].innerText;
        let val3= boxes[pattern[2]].innerText;

        if(val1 != "" && val2 != "" && val3 != "")
            {
                if(val1===val2 && val1 ===val3)
                {
                    displayMessage(val1);
                }
            }
    }
}
function displayMessage(player) {
    message.innerText = `Player ${player} is Winner`;
    container.classList.remove("hide");
    resetbtn.classList.add("hide");
    boxes.forEach((box)=>{
        box.disabled=true;
    })
}

resetbtn.addEventListener("click", ()=>{
    boxes.forEach((box)=>
    {
        box.disabled = false;
        box.innerHTML="";
    })
    turnX =true;
})
newGame.addEventListener("click", ()=>{
    boxes.forEach((box)=>
    {
        box.disabled = false;
        box.innerHTML="";
    })
    turnX =true;
    container.classList.add("hide");
    resetbtn.classList.remove("hide");
})