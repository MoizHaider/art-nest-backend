let nanoid;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
}).catch((error) => {
  console.error('Error importing nanoid:', error);
});

const getNanoid = ()=>{
    return nanoid;
}

module.exports = {getNanoId}