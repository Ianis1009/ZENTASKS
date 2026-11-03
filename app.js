let tasks = JSON.parse(localStorage.getItem("neo_tasks")) || []
let filter = "all"

const list = document.getElementById("list")
const deadline = document.getElementById("deadline")

//stocare locala

function save(){
localStorage.setItem("neo_tasks", JSON.stringify(tasks))
}

//formatare data
function formatTime(d){
if(!d) return "fără termen"
return new Date(d).toLocaleString("ro-RO")
}

//counter
function updateCounter(){
const done = tasks.filter(t => t.done).length
const el = document.getElementById("doneCounter")
if(el) el.innerHTML = `✔ ${done}`
}

//functia main -> render
function render(){

list.innerHTML = ""

let filtered = tasks.filter(t=>{
if(filter === "all") return true
if(filter === "active") return !t.done
if(filter === "done") return t.done
})

filtered.forEach((t)=>{

if(!t.id) t.id = Date.now() + Math.random()

const el = document.createElement("div")
el.className = "task" + (t.done ? " done" : "")

const statusText = t.done ? "DONE" : "TO DO"
const statusClass = t.done ? "done" : "todo"

el.innerHTML = `
<div class="status ${statusClass}">${statusText}</div>

<h3>${t.text}</h3>

<div class="meta">
<span>⏱ ${t.duration || 0} min</span>
<span>📅 ${formatTime(t.deadline)}</span>
</div>

<div class="timer" id="timer-${t.id}">
${t.running ? "⏳ rulează..." : "⏸ oprit"}
</div>

<div class="actions">
${!t.done ? `
<button class="startBtn">start</button>
<button class="finishBtn">done</button>
<button class="editBtn">edit</button>
` : ``}
<button class="deleteBtn">delete</button>
</div>
`

//expandare
el.onclick = (e)=>{
if(e.target.tagName === "BUTTON") return
el.classList.toggle("expanded")
}


//start timer
const startBtn = el.querySelector(".startBtn")
if(startBtn){
startBtn.onclick = (e)=>{
e.stopPropagation()

t.running = true
t.startTime = Date.now()

save()
runTimer(t.id)
}
}

//buton de finish
const finishBtn = el.querySelector(".finishBtn")
if(finishBtn){
finishBtn.onclick = (e)=>{
e.stopPropagation()

t.done = true
t.running = false

showToast("Task finalizat! ✔", "succes")

save()
render()
}
}

//buton de edit

const editBtn = el.querySelector(".editBtn")

if(editBtn !== null){
editBtn.addEventListener("click", (e)=>{
e.stopPropagation()

const newText = prompt("Nume task:", t.text)
if(newText && newText.trim()) t.text = newText

const newDuration = prompt("Durată (min):", t.duration)
if(newDuration !== null && !isNaN(newDuration)) t.duration = newDuration

let datePart = ""
let timePart = ""

if(t.deadline){
const d = new Date(t.deadline)
if(!isNaN(d)){
datePart = d.toISOString().split("T")[0]
timePart = d.toTimeString().slice(0,5)
}
}

const newDate = prompt("Data (YYYY-MM-DD):", datePart)
if(newDate === null) return

const newTime = prompt("Ora (HH:MM):", timePart)
if(newTime === null) return

t.deadline = `${newDate}T${newTime}`

showToast("Task actualizat ✔", "success")
save()
render()
})
}

//buton de delete
const deleteBtn = el.querySelector(".deleteBtn")
deleteBtn.onclick = (e)=>{
e.stopPropagation()

tasks = tasks.filter(x => x.id !== t.id)

showToast("Task sters 🗑", "error")
save()
render()
}

list.appendChild(el)

})

updateCounter()
}

//timer

function runTimer(taskId){

const task = tasks.find(t => t.id === taskId)
if(!task || !task.running) return

function update(){

if(!task.running) return

const el = document.getElementById("timer-"+task.id)
if(!el) return

const total = (task.duration || 0) * 60 * 1000
const elapsed = Date.now() - task.startTime
const remaining = total - elapsed

if(remaining <= 0){
task.running = false
task.done = true
save()
render()
return
}

const min = Math.floor(remaining / 60000)
const sec = Math.floor((remaining % 60000) / 1000)

el.innerHTML = `⏳ ${min}:${sec < 10 ? "0"+sec : sec}`

requestAnimationFrame(update)
}

update()
}

//adaugare task

document.getElementById("add").onclick = ()=>{

const text = document.getElementById("text").value
const duration = document.getElementById("duration").value

if(!text.trim()) return

tasks.unshift({
id: Date.now() + Math.random(),
text,
duration,
deadline: deadline.value,
done:false,
running:false,
startTime:null
})

document.getElementById("text").value=""
document.getElementById("duration").value=""
deadline.value=""

showToast("Task adăugat ✔", "success")
save()
render()
}

//calendar
document.getElementById("calendarBtn").onclick = ()=>{
deadline.showPicker ? deadline.showPicker() : deadline.click()
}

//filters
document.querySelectorAll(".filters button").forEach(b=>{
b.onclick = ()=>{

document.querySelectorAll(".filters button")
.forEach(x=>x.classList.remove("active"))

b.classList.add("active")
filter = b.dataset.f

render()
}
})

render()

function showToast(message,type="info"){
const container = document.getElementById("toast")

const el = document.createElement("div")
el.className = `toast ${type}`
el.innerText = message

container.appendChild(el)

setTimeout(()=>{
el.remove()
},3000)
}