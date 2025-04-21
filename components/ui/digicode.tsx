import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DigicodeProps {
  onSuccess: () => void;
  correctCode?: string;
}

export function Digicode({ onSuccess, correctCode = '1503' }: DigicodeProps) {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const handleNumberClick = (number: string) => {
    if (code.length < 4) {
      setCode(prev => prev + number);
      setError(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setError(false);
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (code.length === 4) {
      if (code === correctCode) {
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setCode('');
        }, 500);
      }
    }
  }, [code, correctCode, onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        className={`bg-white rounded-xl p-8 shadow-2xl w-full max-w-sm mx-4 ${shake ? 'animate-shake' : ''}`}
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Accès sécurisé</h2>
          <p className="text-gray-500">Entrez le code pour accéder à l'Academy</p>
        </div>

        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full mx-2 transition-all duration-200 ${
                index < code.length
                  ? error
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <Button
              key={number}
              variant="outline"
              className="h-14 text-xl font-semibold hover:bg-blue-50"
              onClick={() => handleNumberClick(number.toString())}
            >
              {number}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-14 text-xl font-semibold hover:bg-blue-50"
            onClick={handleClear}
          >
            C
          </Button>
          <Button
            variant="outline"
            className="h-14 text-xl font-semibold hover:bg-blue-50"
            onClick={() => handleNumberClick('0')}
          >
            0
          </Button>
          <Button
            variant="outline"
            className="h-14 text-xl font-semibold hover:bg-blue-50"
            onClick={handleDelete}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm">Code incorrect. Veuillez réessayer.</p>
        )}
      </motion.div>
    </motion.div>
  );
} 