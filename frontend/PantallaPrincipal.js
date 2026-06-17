import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { notaService } from './apiService';

export default function PantallaPrincipal({ navigation }) {
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarNotas();
  }, []);

  const cargarNotas = async () => {
      try {
        setCargando(true);
        const notasData = await notaService.obtenerTodas();
        console.log('📡 Datos recibidos en pantalla:', notasData);
        setNotas(Array.isArray(notasData) ? notasData : []);
      } catch (error) {
        console.error('❌ Error en cargarNotas:', error);
        setNotas([]);
      } finally {
        setCargando(false);
      }
    };

  const onGuardarNota = async (nota) => {
    try {
      if (notas.find(n => n.id === nota.id)) {
        await notaService.actualizar(nota.id, nota);
      } else {
        await notaService.crear(nota);
      }

      await cargarNotas();
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error);
    }
  };

  const borrarNota = async (id) => {
    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await notaService.eliminar(id);
              await cargarNotas();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.textoCarga}>Cargando notas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>NoteNote - Mis Notas</Text>

      <TouchableOpacity
        style={styles.botonCrear}
        onPress={() =>
          navigation.navigate('Nota', {
            onGoBack: onGuardarNota,
          })
        }
      >
        <Text style={styles.textoBoton}>+ Nueva Nota</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.notasContainer}>
        {notas.length === 0 ? (
          <View style={styles.sinNotas}>
            <Text style={styles.textoSinNotas}>No hay notas aún.{'\n'}¡Crea tu primera nota!</Text>
          </View>
        ) : (
          notas.map((nota) => (
            <View
              key={nota.id}
              style={[styles.nota, { backgroundColor: nota.color }]}
            >
              <Text style={styles.textoNota}>{nota.texto}</Text>
              <View style={styles.botones}>
                <TouchableOpacity
                  style={styles.boton}
                  onPress={() =>
                    navigation.navigate('Nota', {
                      nota,
                      onGoBack: onGuardarNota,
                    })
                  }
                >
                  <MaterialIcons name="edit" size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.boton}
                  onPress={() => borrarNota(nota.id)}
                >
                  <MaterialIcons name="delete" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  centrado: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarga: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  sinNotas: {
    alignItems: 'center',
    padding: 40,
  },
  textoSinNotas: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  botonCrear: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  notasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nota: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 4,
  },
  textoNota: {
    fontSize: 16,
    marginBottom: 10,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boton: {
    padding: 4,
  },
});
