import {Request, Response} from 'express';
import { CursoEstudiante } from '../models/cursoEstudianteModel';
import { AppDataSource } from '../db/conexion';
import { Estudiante } from '../models/estudianteModel';
import { Curso } from '../models/cursoModel';
import app from '../app';

//const Joi = require('joi');
var inscripciones: CursoEstudiante[];
export const consultarInscripciones= async(req:Request, res:Response)=>{
            try {
                const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
                 inscripciones = await cursoEstudianteRepository.find({
                    relations: ['curso', 'estudiante'], 
                });
        
               res.render('listarInscripciones', {
                    pagina: 'Listar Inscripciones',
                   inscripciones
               })
            } catch (err: unknown) {
                if (err instanceof Error) {
                    res.status(500).send(err.message);
                }
            }
    }
    
export const consultarxAlumno= async(req:Request, res:Response)=>{
        const { id } = req.params;

        try {
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);

            const resultado = await cursoEstudianteRepository.createQueryBuilder('cursoEstudiante')
                .innerJoinAndSelect('cursoEstudiante.curso', 'curso')
                .innerJoinAndSelect('cursoEstudiante.estudiante', 'estudiante')
                .where('estudiante.id = :id', { id: parseInt(id, 10) })
                .select(['estudiante.nombre AS estudiante', 'curso.nombre AS curso'])
                .getRawMany();

            res.render('listarInscripciones', {
                pagina: 'Listar Inscripciones',
                inscripciones: resultado
            })
        } 
      catch(err){
          if (err instanceof Error){
             res.status(500).send(err.message);
          }
      }
    }
export const consultarxCurso= async(req:Request, res:Response)=>{
        const { id } = req.params;

        try {
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const resultado = await cursoEstudianteRepository.createQueryBuilder('cursoEstudiante')
                .innerJoinAndSelect('cursoEstudiante.curso', 'curso')
                .innerJoinAndSelect('cursoEstudiante.estudiante', 'estudiante')
                .where('curso.id = :id', { id: parseInt(id, 10) })
                .select(['estudiante.nombre AS estudiante', 'curso.nombre AS curso'])
                .getRawMany();

            res.render('listarInscripciones', {
                pagina: 'Listar Inscripciones',
                inscripciones: resultado
            })
        }
      catch(err){
          if (err instanceof Error){
             res.status(500).send(err.message);
          }
      }
    }




export const inscribir = async(req:Request, res:Response) => {

    const { estudiante_id, curso_id } = req.body;
    const estudianteId = parseInt(estudiante_id as string, 10);
    const cursoId = parseInt(curso_id as string, 10);
    console.log(estudianteId);
    console.log(cursoId);
    try {
        const estudianteRepository = AppDataSource.getRepository(Estudiante);
        const cursoRepository = AppDataSource.getRepository(Curso);
        const estudiante = await estudianteRepository.findOneBy({ id: estudianteId });
        if (!estudiante) {
            return res.status(404).json({ mens: 'Estudiante no encontrado' });
        }

        const curso = await cursoRepository.findOneBy({ id: cursoId });
        if (!curso) {
            return res.status(404).json({ mens: 'Curso no encontrado' });
        }

        const inscripcion = new CursoEstudiante();
        inscripcion.estudiante = estudiante;
        inscripcion.curso = curso;
        inscripcion.nota = 0;
        inscripcion.fecha = new Date();
        await AppDataSource.manager.save(inscripcion);
        inscripciones=await AppDataSource.manager.find(CursoEstudiante, {relations: ['curso', 'estudiante']});
        res.render('listarInscripciones', {
            pagina: 'Listar Inscripciones',
            inscripciones
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}
export const cancelarInscripcion= async(req:Request, res:Response) => {
        const { estudiante_id, curso_id } = req.params;

        try {
            await AppDataSource.transaction(async transactionalEntityManager => {
              
                const estudiante = await transactionalEntityManager.findOne(Estudiante, { where: { id: parseInt(estudiante_id, 10) } });
                if (!estudiante) {
                    return res.status(400).json({ mens: 'Estudiante no existe' });
                }

           
                const curso = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(curso_id, 10) } });
                if (!curso) {
                    return res.status(400).json({ mens: 'Curso no existe' });
                }

                const inscripcion = await transactionalEntityManager.findOne(CursoEstudiante, {
                    where: {
                        estudiante: { id: parseInt(estudiante_id, 10) },
                        curso: { id: parseInt(curso_id, 10) }
                    }
                });
                if (!inscripcion) {
                    return res.status(400).json({ mens: 'La inscripción no existe' });
                }
 
                if (inscripcion.nota > 0) {
                    return res.status(400).json({ mens: 'No se puede cancelar la inscripción porque el estudiante ya ha sido calificado' });
                }
               
                await transactionalEntityManager.remove(inscripcion);

                res.status(200).json({ mens: 'Inscripción cancelada' });
            });
        } 
      catch(err){
          if (err instanceof Error){
             res.status(500).send(err.message);
          }
      }
      }
      
    
export const calificar = async(req: Request, res: Response) => {
    const { estudiante_id, curso_id } = req.params; 
    const { nota } = req.body; 

    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);

        if (nota == null || isNaN(nota) || nota < 0 || nota > 10) { 
            return res.status(400).json({ mensaje: "Nota inválida, debe ser un número entre 0 y 10" });
        }

        const cursoEstudiante = await cursoEstudianteRepository.findOneBy({ 
            estudiante_id: parseInt(estudiante_id, 10), 
            curso_id: parseInt(curso_id, 10) 
        });

        if (!cursoEstudiante) {
            return res.status(404).json({ mensaje: "Inscripción no encontrada para el estudiante en el curso especificado" });
        }
        cursoEstudiante.nota = nota;
        cursoEstudiante.fecha = new Date(); 
      
        const resultado = await cursoEstudianteRepository.save(cursoEstudiante);

        res.status(200).json({ mensaje: "Nota asignada correctamente", resultado });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};
