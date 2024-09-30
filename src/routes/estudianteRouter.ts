import express from 'express';
import { insertar, modificar, eliminar, validar, consultarUno, consultarTodos, consultarEstudiante } from '../controllers/EstudianteController';
import { consultarxCurso } from '../controllers/InscripcionController';
import { obtenerlistadeCursos } from '../controllers/CursoController';


const router = express.Router();

router.get('/listarEstudiantes', consultarTodos);

//insertar

router.get('/listarEstudianteporCurso',async (req, res) => {
    const cursos= await consultarxCurso(req, res);
    res.render('listarEstudianteporCurso', {
        pagina: 'Listar Estudiantes por Curso',
        cursos
    });
})

router.get('/listarEstudianteporCurso/:curso_id',consultarxCurso);

router.get( '/consultarEstudiante/:estudiante_id',consultarEstudiante);

router.get('/creaEstudiantes', (req, res) => {
    res.render('creaEstudiantes', {
        pagina: 'Crear Estudiante',
    });
});

router.get('/modificaEstudiante/:id', async (req, res) => {
    const estudiante = await consultarUno(req, res);
    if (!estudiante) {
        return res.status(404).send('Estudiante no encontrado');
    }
    res.render('modificaEstudiante', {
        estudiante,
    });
});

 router.post('/', validar(), insertar);


//modificar
router.get('/modificaEstudiante/:id', async (req, res) => {
    try {
        const estudiante = await consultarUno(req, res); 
        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado');
        }
        res.render('modificaEstudiante', {
            estudiante, 
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
