import React from 'react';
import { render, screen } from '@testing-library/react';
import ReservaCliente from './ReservaCliente';

describe('ReservaCliente', () => {
  it('muestra el título del formulario', () => {
    render(<ReservaCliente />);
    expect(screen.getByText(/Formulario de Reserva/i)).toBeInTheDocument();
  });
});