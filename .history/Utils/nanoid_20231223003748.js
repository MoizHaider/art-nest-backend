let nano;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
}).catch((error) => {
  console.error('Error importing nanoid:', error);
});

const nanoid = ()=>{
    return nano;
}

module.exports = {nanoid}