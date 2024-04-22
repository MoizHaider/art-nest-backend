let nanoid;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
}).catch((error) => {
  console.error('Error importing nanoid:', error);
});
return nanoid