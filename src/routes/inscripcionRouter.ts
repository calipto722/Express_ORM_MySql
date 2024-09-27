import express from "express";
const router=express.Router();
import {consultarInscripciones,consultarxAlumno,consultarxCurso,inscribir,cancelarInscripcion,calificar} from '../controllers/InscripcionController';
import {obtenerlistadeCursos} from '../controllers/CursoController';
import {consultarProfes} from '../controllers/ProfesoresController';
import { consultarTodos, listarEstudiantes } from "../controllers/EstudianteController";
router.get('/listarInscripciones',
    consultarInscripciones);
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
router.post('/:estudiante_id/:curso_id',inscribir);
router.delete('/:estudiante_id/:curso_id',cancelarInscripcion);
router.post('/:estudiante_id/:curso_id/calificar',calificar);
export default router;