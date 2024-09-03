import { useState } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';
import { TextField, Button, Box, Container, Snackbar, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import * as Yup from 'yup';
import axios from 'axios';
import dayjs from 'dayjs';

interface LPJForm {
    no_request: string,
    nama_pemohon: string,
    jabatan: string,
    nama_departemen: string,
    uraian: string,
    nama_jenis: string,
    jml_request: number,
    jml_terbilang: string,
    deskripsi: string,
    harga: number,
    total: number,
    tgl_lpj: string,
    kode_departemen: string,
    nama_approve_vpkeu: string,
    nama_approve_vptre: string,
    nama_approve_vp: string,
}

const validationSchema = Yup.object().shape({
    no_request: Yup.string().required('Required'),
    nama_pemohon: Yup.string().required('Required'),
    jabatan: Yup.string().required('Required'),
    nama_departemen: Yup.string().required('Required'),
    uraian: Yup.string().required('Required'),
    nama_jenis: Yup.string().required('Required'),
    jml_request: Yup.number().required('Required').positive('Must be positive'),
    jml_terbilang: Yup.string().required('Required'),
    deskripsi: Yup.string().required('Required'),
    harga: Yup.number().required('Required').positive('Must be positive'),
    total: Yup.number().required('Required').positive('Must be positive'),
    tgl_lpj: Yup.date().required('Required'),
    kode_departemen: Yup.string().required('Required'),
    nama_approve_vpkeu: Yup.string().required('Required'),
    nama_approve_vptre: Yup.string().required('Required'),
    nama_approve_vp: Yup.string().required('Required'),
  });

export default function LPJForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [dataForm, setDataForm] = useState<LPJForm>({
        no_request: '',
        nama_pemohon: '',
        jabatan: '',
        nama_departemen: '',
        uraian: '',
        nama_jenis: '',
        jml_request: 0,
        jml_terbilang: '',
        deskripsi: '',
        harga: 0,
        total: 0,
        tgl_lpj: '',
        kode_departemen: '',
        nama_approve_vpkeu: '',
        nama_approve_vptre: '',
        nama_approve_vp: '',
    })

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        try {
            const response = await axios.post('http://localhost:5000/generate-template', values, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                const contentType = response.headers['content-type'];
                if (contentType && contentType.includes('application/pdf')) {
                    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                    const downloadUrl = window.URL.createObjectURL(pdfBlob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.setAttribute('download', 'LPJ_PUM.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } else {
                    const reader = new FileReader();
                    reader.onload = function() {
                        const errorText = reader.result as string;
                        setErrorMessage(errorText || 'An unknown error occurred');
                    };
                    reader.readAsText(response.data);
                }
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            if (axios.isAxiosError(error) && error.response) {
                setErrorMessage(error.response.data.error || 'Error generating PDF. Please try again.');
            } else {
                setErrorMessage('An unexpected error occurred. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container>
            <Box display="grid" gridTemplateColumns="repeat(1, 1fr)" gap={2} sx={{px:3, py:2}}>
                <Formik
                initialValues={dataForm}
                validationSchema={validationSchema}
                onSubmit={handleSubmit} >
                    {({ errors, touched, isSubmitting, setFieldValue }) => (
                    <Form>
                        <Box display="grid" gridTemplateColumns="repeat(1, 1fr)" gap={2}>
                            <Field
                                as={TextField}
                                name="no_request"
                                label="Nomor"
                                error={touched.no_request && !!errors.no_request}
                                helperText={touched.no_request && errors.no_request}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="nama_pemohon"
                                label="Nama"
                                error={touched.nama_pemohon && !!errors.nama_pemohon}
                                helperText={touched.nama_pemohon && errors.nama_pemohon}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="jabatan"
                                label="Jabatan"
                                error={touched.jabatan && !!errors.jabatan}
                                helperText={touched.jabatan && errors.jabatan}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="nama_departemen"
                                label="Divisi"
                                error={touched.nama_departemen && !!errors.nama_departemen}
                                helperText={touched.nama_departemen && errors.nama_departemen}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="uraian"
                                label="Program Kerja"
                                error={touched.uraian && !!errors.uraian}
                                helperText={touched.uraian && errors.uraian}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="nama_jenis"
                                label="Jenis Program Kerja"
                                error={touched.nama_jenis && !!errors.nama_jenis}
                                helperText={touched.nama_jenis && errors.nama_jenis}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="jml_request"
                                label="Jumlah Pertanggungjawaban"
                                type="number"
                                error={touched.jml_request && !!errors.jml_request}
                                helperText={touched.jml_request && errors.jml_request}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="jml_terbilang"
                                label="Terbilang"
                                error={touched.jml_terbilang && !!errors.jml_terbilang}
                                helperText={touched.jml_terbilang && errors.jml_terbilang}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="deskripsi"
                                label="Deskripsi"
                                error={touched.deskripsi && !!errors.deskripsi}
                                helperText={touched.deskripsi && errors.deskripsi}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="harga"
                                label="Harga"
                                type="number"
                                error={touched.harga && !!errors.harga}
                                helperText={touched.harga && errors.harga}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="total"
                                label="Total"
                                type="number"
                                error={touched.total && !!errors.total}
                                helperText={touched.total && errors.total}
                                fullWidth
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Field
                                name="tgl_lpj"
                                component={({ field }: FieldProps) => (
                                    <DatePicker
                                    label="Tanggal"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(newValue) => {
                                        setFieldValue(field.name, newValue?.format('M/D/YYYY') || '');
                                        console.log(newValue)
                                    }}
                                    slots={{ textField: (props) => <TextField {...props} fullWidth /> }}
                                    />
                                    )}
                                />
                            </LocalizationProvider>
                            <Field
                                as={TextField}
                                name="kode_departemen"
                                label="Kode Department"
                                error={touched.kode_departemen && !!errors.kode_departemen}
                                helperText={touched.kode_departemen && errors.kode_departemen}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="nama_approve_vpkeu"
                                label="Nama Approve VPKEU"
                                error={touched.nama_approve_vpkeu && !!errors.nama_approve_vpkeu}
                                helperText={touched.nama_approve_vpkeu && errors.nama_approve_vpkeu}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="nama_approve_vptre"
                                label="Nama Approve VPTRE"
                                error={touched.nama_approve_vptre && !!errors.nama_approve_vptre}
                                helperText={touched.nama_approve_vptre && errors.nama_approve_vptre}
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                name="nama_approve_vp"
                                label="Nama Approve VP"
                                error={touched.nama_approve_vp && !!errors.nama_approve_vp}
                                helperText={touched.nama_approve_vp && errors.nama_approve_vp}
                                fullWidth
                            />
                        </Box>
                        <Button variant='contained' type="submit" color="primary" disabled={isSubmitting} sx={{my:2, py:1, px:2, width:'100px'}}>
                            Submit
                        </Button>
                    </Form>
                    )}
                </Formik>
                <Snackbar 
                open={!!errorMessage} 
                autoHideDuration={6000} 
                onClose={() => setErrorMessage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            </Box>
        </Container>
    )
}