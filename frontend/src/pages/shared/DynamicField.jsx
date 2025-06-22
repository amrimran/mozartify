import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Component to render different field types based on field configuration
const DynamicField = ({ field, value, onChange, formStyles, isMobile }) => {
  switch (field.fieldType) {
    case 'text':
      return (
        <TextField
          name={field.name}
          label={field.label}
          variant="outlined"
          fullWidth
          sx={formStyles}
          value={value || ''}
          onChange={onChange}
          required={field.required}
          error={field.required && !value}
          helperText={field.required && !value ? 'This field is required' : ''}
        />
      );
      
    case 'number':
      return (
        <TextField
          name={field.name}
          label={field.label}
          variant="outlined"
          fullWidth
          type="number"
          sx={formStyles}
          value={value || ''}
          onChange={onChange}
          required={field.required}
          inputProps={{
            min: field.validationRules?.min,
            max: field.validationRules?.max,
          }}
          error={field.required && !value}
          helperText={field.required && !value ? 'This field is required' : ''}
        />
      );
      
    case 'price':
      return (
        <TextField
          name={field.name}
          label={field.label}
          variant="outlined"
          fullWidth
          type="number"
          sx={formStyles}
          value={value || ''}
          onChange={onChange}
          required={field.required}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ fontFamily: "Montserrat" }}>
                RM
              </InputAdornment>
            ),
          }}
          error={field.required && !value}
          helperText={field.required && !value ? 'This field is required' : ''}
        />
      );
      
    case 'textarea':
      return (
        <TextField
          name={field.name}
          label={field.label}
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          sx={formStyles}
          value={value || ''}
          onChange={onChange}
          required={field.required}
          error={field.required && !value}
          helperText={field.required && !value ? 'This field is required' : ''}
        />
      );
      
    case 'date':
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={field.label}
            value={value ? new Date(value) : null}
            onChange={(newValue) => {
              onChange({
                target: {
                  name: field.name,
                  value: newValue ? newValue.toISOString() : '',
                },
              });
            }}
            format="dd/MM/yyyy"
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                variant: "outlined",
                fullWidth: true,
                required: field.required,
                sx: formStyles,
                error: field.required && !value,
                helperText: field.required && !value ? 'This field is required' : '',
              },
            }}
          />
        </LocalizationProvider>
      );
      
    case 'select':
      return (
        <FormControl
          variant="outlined"
          fullWidth
          required={field.required}
          error={field.required && !value}
          sx={{
            ...formStyles,
            mb: 2,
            width: isMobile ? "90%" : "90%",
            "& .MuiInputBase-root": {
              fontFamily: "Montserrat",
              "& fieldset": {
                borderColor: "#FFB6C1",
              },
              "&:hover fieldset": {
                borderColor: "#FFA0B3",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#FFA0B3",
              },
            },
            "& .MuiInputLabel-root": {
              fontFamily: "Montserrat",
            },
          }}
        >
          <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
          <Select
            labelId={`${field.name}-label`}
            name={field.name}
            value={value || ''}
            onChange={onChange}
            label={field.label}
            sx={{
              fontFamily: "Montserrat",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FFB6C1",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FFA0B3",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FFA0B3",
              },
              "& .MuiSvgIcon-root": {
                color: "#FFB6C1",
              },
              "&.Mui-focused .MuiSvgIcon-root": {
                color: "#FFA0B3",
              },
            }}
          >
            {field.options && field.options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ fontFamily: "Montserrat" }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {field.required && !value && (
            <FormHelperText>This field is required</FormHelperText>
          )}
        </FormControl>
      );
      
    default:
      return null;
  }
};

export default DynamicField;