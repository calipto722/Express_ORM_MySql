import express from "express";
import  {insertar, modificar, eliminar, consultarUno, consultarTodosProfes,validar} from "../controllers/ProfesoresController";
import { consultarTodos } from "../controllers/EstudianteController";

const router=express.Router();

/*router.get('/listarProfesores', async (req, res) => {
    const profesores = await consultarTodosProfes(req, res);
    res.render('listarProfesores', {
        pagina: 'Listar Profesores',
        profesores
});
});*/
//insertar

router.get('/listarProfesores', consultarTodosProfes);
router.get('/creaProfesores', (req, res) => {
    
    res.render('creaProfesores', {
            pagina: 'Crear Profesor',
        });
    });

router.post('/', insertar);

//modificar
router.get('/modificaProfesor/:id', async (req, res) => {
    
     const profesor = await consultarUno(req, res);
     
    if (!profesor) {
        return res.status(404).send('Profesor no encontrado');
    }
        try{ 
        res.render('modificaProfesor', {
            profesor,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
router.put('/:id', modificar);
router.delete('/:id', eliminar);
export default router;