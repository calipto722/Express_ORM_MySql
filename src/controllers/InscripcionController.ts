import {Request, Response} from 'express';
import { CursoEstudiante } from '../models/cursoEstudianteModel';
import { AppDataSource } from '../db/conexion';
import { Estudiante } from '../models/estudianteModel';
import { Curso } from '../models/cursoModel';

//const Joi = require('joi');
var inscripciones: CursoEstudiante[];
export const consultarInscripciones= async(req:Request, res:Response)=>{
            try {
                const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
                const resultado = await cursoEstudianteRepository.find({
                    relations: ['curso', 'estudiante'], 
                });
        
               res.render('listarInscripciones', {
                    pagina: 'Listar Inscripciones',
                   inscripciones: resultado
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

    const { estudiante_id, curso_id} = req.body;
    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
            // Verificar si el estudiante existe
            const estudiante = await transactionalEntityManager.findOne(Estudiante, { where: { id: estudiante_id } });
            if (!estudiante) {
                return res.status(400).json({ mens: 'Estudiante no existe' });
            }

            // Verificar si el curso existe
            const curso = await transactionalEntityManager.findOne(Curso, { where: { id: curso_id } });
            if (!curso) {
                return res.status(400).json({ mens: 'Curso no existe' });
            }

            // Verificar si ya está inscrito
            const existeInscripcion = await transactionalEntityManager.findOne(CursoEstudiante, { where: { estudiante: estudiante_id, curso: curso_id } });
            if (existeInscripcion) {
                return res.status(400).json({ mens: 'El estudiante ya está inscrito en este curso' });
            }

            // Insertar inscripción
            const cursoEstudiante = new CursoEstudiante();
            cursoEstudiante.estudiante = estudiante;
            cursoEstudiante.curso = curso;
            await transactionalEntityManager.save(cursoEstudiante);

            res.redirect('/inscripciones/listarInscripciones');
        });
    } 
  catch(err){
      if (err instanceof Error){
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
