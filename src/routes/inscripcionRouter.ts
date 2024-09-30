import express from "express";
import {consultarInscripciones,consultarxAlumno,consultarxCurso,inscribir,cancelarInscripcion,calificar, inscripcionEnUso} from '../controllers/InscripcionController';
import {obtenerlistadeCursos} from '../controllers/CursoController';
import { consultarEstudiante, consultarTodos, consultarUno, listarEstudiantes } from "../controllers/EstudianteController";


const router=express.Router();


router.get('/listarInscripciones',consultarInscripciones);

router.get('/xAlumno/:id',consultarxAlumno);

router.get('/xCurso/:id',consultarxCurso);

router.get("/creaInscripcion",async (req, res) => {
    const cursos = await obtenerlistadeCursos();
    const estudiantes = await listarEstudiantes(req, res);
    res.render('creaInscripcion', {
        pagina: 'Crear Inscripción',
        cursos,
        estudiantes,
    });
});

router.post('/',inscribir);

router.get('/modificaInscripcion/:estudiante_id/:curso_id',inscripcionEnUso);

router.post('/modificaInscripcion/:estudiante_id/:curso_id',calificar);

router.delete('/:estudiante_id/:curso_id',cancelarInscripcion);

export default router;