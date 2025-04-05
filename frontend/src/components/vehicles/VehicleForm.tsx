import React, { useCallback, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Vehicle, VehicleCategory, VehicleFormData } from '../../types/vehicle';

interface VehicleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: VehicleFormData) => void;
  initialValues?: Vehicle;
  title: string;
}

const validationSchema = yup.object({
  brand: yup.string().required('Marca é obrigatória'),
  model: yup.string().required('Modelo é obrigatório'),
  year: yup
    .number()
    .required('Ano é obrigatório')
    .min(1900, 'Ano deve ser maior que 1900')
    .max(new Date().getFullYear() + 1, 'Ano não pode ser maior que o próximo ano'),
  plate: yup
    .string()
    .required('Placa é obrigatória')
    .matches(
      /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/,
      'Placa deve estar no formato ABC1234 (padrão antigo) ou ABC1D23 (padrão Mercosul)'
    ),
  category: yup.string().required('Categoria é obrigatória'),
  dailyRate: yup
    .number()
    .required('Diária é obrigatória')
    .min(0, 'Diária deve ser maior que zero')
});

export const VehicleForm: React.FC<VehicleFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title
}) => {
  const formik = useFormik({
    initialValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      category: VehicleCategory.STANDARD,
      dailyRate: 0
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
    },
    enableReinitialize: true
  });

  // Atualiza os valores do formulário quando initialValues mudar
  useEffect(() => {
    if (initialValues) {
      formik.setValues({
        brand: initialValues.brand || '',
        model: initialValues.model || '',
        year: initialValues.year || new Date().getFullYear(),
        plate: initialValues.plate || '',
        category: initialValues.category || VehicleCategory.STANDARD,
        dailyRate: initialValues.dailyRate || 0
      });
    }
  }, [initialValues, formik.setValues]);

  const handleClose = useCallback(() => {
    formik.resetForm();
    onClose();
  }, [formik, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="brand"
                name="brand"
                label="Marca"
                value={formik.values.brand}
                onChange={formik.handleChange}
                error={formik.touched.brand && Boolean(formik.errors.brand)}
                helperText={formik.touched.brand && formik.errors.brand}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="model"
                name="model"
                label="Modelo"
                value={formik.values.model}
                onChange={formik.handleChange}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={formik.touched.model && formik.errors.model}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="year"
                name="year"
                label="Ano"
                type="number"
                value={formik.values.year}
                onChange={formik.handleChange}
                error={formik.touched.year && Boolean(formik.errors.year)}
                helperText={formik.touched.year && formik.errors.year}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="plate"
                name="plate"
                label="Placa"
                value={formik.values.plate}
                onChange={(e) => {
                  const upperValue = e.target.value.toUpperCase();
                  formik.setFieldValue('plate', upperValue);
                }}
                error={formik.touched.plate && Boolean(formik.errors.plate)}
                helperText={
                  (formik.touched.plate && formik.errors.plate) || 
                  'Ex: ABC1234 (padrão antigo) ou ABC1D23 (Mercosul)'
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Categoria</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  label="Categoria"
                >
                  {Object.values(VehicleCategory).map((category: VehicleCategory) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="dailyRate"
                name="dailyRate"
                label="Diária"
                type="number"
                value={formik.values.dailyRate}
                onChange={formik.handleChange}
                error={formik.touched.dailyRate && Boolean(formik.errors.dailyRate)}
                helperText={formik.touched.dailyRate && formik.errors.dailyRate}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 