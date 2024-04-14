let nanoid;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
}).catch((error) => {
  console.error('Error importing nanoid:', error);
});

const nanoid = ()=>{
    return nanoid;
}

module.exports = {nanoid}