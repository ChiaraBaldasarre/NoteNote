import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';

const coloresDisponibles = [
  '#FFF59D', // amarillo claro
  '#FFCC80', // naranja pastel
  '#90CAF9', // azul pastel
  '#A5D6A7', // verde pastel
  '#CE93D8', // violeta pastel
];

export default function PantallaNota({ route, navigation }) {
  const notaExistente = route.params?.nota;
  const onGoBack = route.params?.onGoBack;

  const [texto, setTexto] = useState(notaExistente?.texto || '');
  const [color, setColor] = useState(notaExistente?.color || coloresDisponibles[0]);

  const guardarNota = () => {
    if (texto.trim()) {
      const notaParaGuardar = {
        id: notaExistente?.id || Date.now().toString(),
        texto,
        color,
      };
      if (onGoBack) onGoBack(notaParaGuardar);
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.titulo}>Escribí tu nota:</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Escribí algo..."
        value={texto}
        onChangeText={setTexto}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Elegí un color:</Text>
      <View style={styles.paleta}>
        {coloresDisponibles.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorCirculo,
              { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: '#000' },
            ]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <Button title="Guardar nota" onPress={guardarNota} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    fontSize: 18,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  paleta: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  colorCirculo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});
