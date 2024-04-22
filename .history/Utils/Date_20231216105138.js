let date

const setDate = (newDate)=>{
    date = newDate;
    return date;
} 
const getDate = ()=>{
    return date;
}
module.exports = {setDate, getDate}