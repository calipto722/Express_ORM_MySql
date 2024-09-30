import express from "express";
import { insertar, modificar, eliminar, consultarUno, obtenerlistadeCursos,validarCurso } from '../controllers/CursoController';
import { validar } from "../controllers/EstudianteController";
import { consultarProfes, consultarTodosProfes } from "../controllers/ProfesoresController";
const router=express.Router();


router.get('/listarCursos', async (req, res) => {
    
    const cursos = await obtenerlistadeCursos();
    res.render('listarCursos', {
        pagina: 'Listar Cursos',
        cursos
})      
});
//router.get('/listarCursos',consultarTodos);

router.get('/consultarCurso', async (req, res) => {
    try {
        res.render('consultarCurso', {
            pagina: 'Consultar Cursos',
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
}
});
router.get( '/consultarCurso/:id',async (req, res) => {
   
    console.log(String(req.params)); });
//router.get('/consultarCurso/:id', consultarCurso);
router.get('/creaCursos', async (req, res) => {
    const profesores = await consultarProfes(req, res);
    
    res.render('creaCursos', {
        pagina: 'Crear Cursos',
        profesores});
});
router.post('/',validarCurso(), insertar);

//modificar
router.get('/modificaCurso/:id', async (req, res) => {
    try {
        const curso = await consultarUno(req, res);
        const profesores = await consultarProfes(req, res); 
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        res.render('modificaCurso', {
            curso, 
            profesores
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
router.put('/:id', modificar);

//eliminar
router.delete('/:id', eliminar);

export default router;