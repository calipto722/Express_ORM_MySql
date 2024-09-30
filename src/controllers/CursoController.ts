import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { AppDataSource } from '../db/conexion';
import { Curso } from '../models/cursoModel';
import { Profesor } from '../models/profesorModel';
import { error } from 'console';
import { CursoEstudiante } from '../models/cursoEstudianteModel';


var cursos: Curso[];
export const validarCurso = () => [
    check('nombre').notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El Nombre debe tener al menos 3 caracteres'),
    check('descripcion').notEmpty().withMessage('La descripcion es obligatorio')
        .isLength({ min: 3 }).withMessage('La Descripcion debe tener al menos 3 caracteres'),
    async (req: Request, res: Response, next: NextFunction) => {
        const errores = validationResult(req);
        const profesoresrepository = AppDataSource.getRepository(Profesor);
        const profesores = await profesoresrepository.find();
        
        if (!errores.isEmpty()) {
            return res.render('creaCursos', {
                pagina: 'Crear Curso',
                errores: errores.array()
                ,profesores
            });
        }
        next();
    }
];


export const obtenerlistadeCursos = async (): Promise<Curso[]> => {
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        cursos = await cursoRepository.find({ relations: ["profesor"] });
        return cursos; // Envolver el array en un objeto
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err;
        } else {
            throw new Error('Error desconocido');
        }
    }
}


export const consultarCurso = async (req: Request, res: Response) => {
    const {nombre} = req.params;
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const curso = await cursoRepository.findOne({ where: { nombre } });
        res.render('listarCursos', {
                pagina: 'Cursos',
                curso
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err;
        } else {
            throw new Error('Error desconocido');
        }
    }
}
export const consultarUno= async (req: Request, res: Response): Promise<Curso | null> => {
    const { id } = req.params;
    console.log(id);
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        throw new Error('ID inválido, debe ser un número');
    }

    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const curso = await cursoRepository.findOne({
            where: { id: idNumber },
            relations: ["profesor"]
        });
        if (curso) {
            return curso
        } else {
            return null;
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err;
        }else{
            throw new Error('Error desconocido');
        }
    }
}

export const insertar = async (req: Request, res: Response) => {  
    console.log(req.body);
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.render('creaCursos', {
            pagina: 'Crear Curso',
            errores: errores.array()
        });
    }
    const { nombre, descripcion, profesor_id } = req.body;
    
    try {
        console.log(req.body);

        await AppDataSource.transaction(async transactionalEntityManager => {
               
            const cursoRepository = await transactionalEntityManager.getRepository(Curso)
            const profesorRepository = await transactionalEntityManager.getRepository(Profesor);
            
            
            //verifico que exista el profesor que elijo para el curso
            const existeProfesor = await profesorRepository.findOne({ where: { id: profesor_id } });
            console.log('Profesor encontrado:', existeProfesor);

            if (!existeProfesor) {
                throw new Error('El profesor no existe.');
            }

            //verifico que exista el curso que 
            const existeCurso = await cursoRepository.findOne({
                where: [
                    { nombre },
                    { descripcion }
                ]
            });

            if (existeCurso) {
                throw new Error('El curso ya existe.');
            }
            

            const nuevoCurso = cursoRepository.create({ nombre, descripcion, profesor: existeProfesor }); // Aquí asigno el objeto Profesor
            console.log('Nuevo curso a insertar:', nuevoCurso);
            await cursoRepository.save(nuevoCurso);
          
        });
        // Redireccionar o mostrar mensaje de éxito
            res.redirect('/cursos/listarCursos'); // Redireccionar a la lista de cursos después de la inserción
           
    
        } 
        catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    }

export const modificar= async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, descripcion, profesor_id } = req.body;

    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
            // Verificar si el profesor existe
            const profesor = await transactionalEntityManager.findOne(Profesor, { where: { id: profesor_id } });
            if (!profesor) {
                return res.status(400).json({ mensaje: 'El profesor no existe' });
            }
            // Verificar si el curso existe
            const curso = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(id) } });
            if (!curso) {
                return res.status(404).json({ mensaje: 'El curso no existe' });
            }
            // Actualizar el curso utilizando merge
            transactionalEntityManager.merge(Curso, curso, {
                nombre,
                descripcion,
                profesor,
            });

            // Guardar los cambios
            const cursoActualizado = await transactionalEntityManager.save(curso);
            
            res.redirect('/cursos/listarCursos');
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}
    
    

export const eliminar = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        console.log(`ID recibido para eliminar el curso: ${id}`);
        await AppDataSource.transaction(async transactionalEntityManager => {
            const cursoRepository = transactionalEntityManager.getRepository(Curso);
            const curso = await cursoRepository.findOne({ where: { id: parseInt(id, 10) } });
            const cursoComprometido = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(id) }, relations: ["profesor"] });
            console.log('Curso encontrado:', curso);
            
            if (cursoComprometido !== null) {
                throw new Error('El curso tiene alumnos asociados.');
            }
            
            const deleteResult = await cursoRepository.delete(id);

            if (deleteResult.affected === 1) {
                res.status(200).json({ mensaje: 'Curso eliminado' }); // Enviar respuesta con estado 200
            } 
            
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ mensaje: err.message });
        } else {
            res.status(500).json({ mensaje: 'Error desconocido' });
        }
    }
};
