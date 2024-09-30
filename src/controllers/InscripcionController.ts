import e, {Request, Response} from 'express';
import { CursoEstudiante } from '../models/cursoEstudianteModel';
import { AppDataSource } from '../db/conexion';
import { Estudiante } from '../models/estudianteModel';
import { Curso } from '../models/cursoModel';
import { validationResult } from 'express-validator';



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
    const estudianteId = Number(id); 
    try {
        const estudianteRepository = AppDataSource.getRepository(Estudiante);
        const estudiante = await estudianteRepository.findOne({ where: { id: estudianteId } });
        if (!estudiante) {
            throw new Error('Estudiante no existe');
        }

        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
        const inscripciones = await cursoEstudianteRepository.find({
            where: { estudiante: { id: estudianteId } },
            relations: ['curso', 'estudiante']
        }); 

        res.render('listarInscripciones', {
            pagina: 'Listar Inscripciones',
            inscripciones
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}
export const consultarxCurso= async(req:Request, res:Response)=>{
        const { id } = req.params;
        const cursoId = Number(id);
        try {
            const cursoRepository = AppDataSource.getRepository(Curso);
            const curso = await cursoRepository.findOne({ where: { id: cursoId } });
            if (!curso) {
                throw new Error('Curso no existe');
            }
    
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const inscripciones = await cursoEstudianteRepository.find({
                where: { curso: { id: cursoId } },
                relations: ['curso', 'estudiante']
            });
    
            res.render('listarInscripciones', {
                pagina: 'Listar Inscripciones',
                inscripciones
            });
        }
      catch(err){
          if (err instanceof Error){
             res.status(500).send(err.message);
          }
      }
    }




export const inscribir = async(req:Request, res:Response): Promise <void> => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.render('creaEstudiantes', {
            pagina: 'Crear Estudiante',
            errores: errores.array()
        });
    }

    const { estudiante_id, curso_id } = req.body;
    try {
        await AppDataSource.transaction(async(transactionalEntityManager) => {
            const inscripcionRepository = transactionalEntityManager.getRepository(CursoEstudiante);
            const estudiante = await transactionalEntityManager.findOne(Estudiante, { where: { id: parseInt(estudiante_id, 10) } });
            if (!estudiante) {
                throw new Error('Estudiante no existe');
            } 
            const curso = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(curso_id, 10) } });
            if (!curso) {
                throw new Error('Curso no existe');
            }   
            var inscripciones = await inscripcionRepository.find({ relations: ['curso', 'estudiante'] });

            for (const inscripcion of inscripciones) {
                if (inscripcion.estudiante.id === estudiante.id && inscripcion.curso.id === curso.id) {
                    throw new Error('El estudiante ya se encuentra inscrito en este curso');
                }
            }

            const inscripcion = new CursoEstudiante();
            inscripcion.estudiante = estudiante;
            inscripcion.curso = curso;
            
            await inscripcionRepository.save(inscripcion);
            inscripciones = await inscripcionRepository.find({ relations: ['curso', 'estudiante'] });
               res.render('listarInscripciones', {
                   pagina: 'Listar Inscripciones',
                   inscripciones
               })
            

        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}
export const cancelarInscripcion= async(req:Request, res:Response) => {
        const { estudiante_id, curso_id } = req.params;
        console.log(estudiante_id);
        console.log(curso_id);
       
        try {
            await AppDataSource.transaction(async transactionalEntityManager => {
                const inscripcionRepository = transactionalEntityManager.getRepository(CursoEstudiante);

                const inscripcion = await inscripcionRepository.findOne({ 
                    where: { estudiante_id: Number(estudiante_id), curso_id: Number(curso_id) },
                   
                });
                if (!inscripcion) {
                    throw new Error('Inscripción no encontrada');
                }
                if (inscripcion.nota > 0) {
                    return res.status(400).json({ mensaje: 'La inscripción ya fue calificada y no se puede cancelar' });
                }
               
                const resultado = await transactionalEntityManager.remove(inscripcion);
                 return res.json({ mensaje: 'Inscripcion eliminada' });
            });
        } 
      catch(err){
          if (err instanceof Error){
             res.status(500).send(err.message);
          }
      }
      }
      
    
export const inscripcionEnUso = async(req: Request, res: Response)  => {
    try {
        const { estudiante_id, curso_id } = req.params;
        console.log(estudiante_id);
        console.log(curso_id);
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
        const inscripcion = await cursoEstudianteRepository.findOne({
            where: {
                estudiante_id: Number(estudiante_id),
                curso_id: Number(curso_id)
            },
            relations: ['estudiante', 'curso']
        });

        if (!inscripcion) {
            return res.status(404).send('Inscripción no encontrada');
        }

        const estudianteRepository = AppDataSource.getRepository(Estudiante);
        const cursoRepository = AppDataSource.getRepository(Curso);
        
        const estudiantes = await estudianteRepository.find();
        const cursos = await cursoRepository.find();
        
        res.render('modificaInscripcion', {
            pagina: 'Modificar Inscripción',
            inscripcion : inscripcion,
            estudiantes,
            cursos
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el formulario de modificación');
    }
};

export const calificar = async(req: Request, res: Response) => {
    try {
        const { estudiante_id, curso_id } = req.params;
        const { nota } = req.body;
console.log(estudiante_id);
console.log(curso_id);
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
        
        const cursoEstudiante = await cursoEstudianteRepository.findOne({
            where: {
                estudiante_id: Number(estudiante_id),
                curso_id: Number(curso_id)
            }
        });

        if (!cursoEstudiante) {
            return res.status(404).send('Inscripción no encontrada');
        }

        cursoEstudiante.nota = nota;
        await cursoEstudianteRepository.save(cursoEstudiante);

        res.redirect('/inscripciones/listarInscripciones');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar la inscripción');
    }
}
function redirect(arg0: string) {
    throw new Error('Function not implemented.');
}

