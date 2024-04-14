let date

setDate = (newDate)=>{
    date = newDate;
    return date;
} 
getDate = ()=>{
    return date;
}
module.exports = {setDate, get}