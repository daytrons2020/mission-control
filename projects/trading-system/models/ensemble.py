"""
Machine Learning Prediction Models
LSTM + XGBoost Ensemble
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class Prediction:
    """Model prediction output"""
    direction: int  # 1 for up, -1 for down, 0 for neutral
    confidence: float  # 0.0 to 1.0
    probability: float  # Probability of direction


class MLModel(ABC):
    """Base class for ML models"""
    
    @abstractmethod
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        pass
    
    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        pass
    
    @abstractmethod
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        pass


class LSTMModel(MLModel):
    """
    LSTM model for time series prediction
    """
    
    def __init__(self, 
                 sequence_length: int = 60,
                 units: List[int] = None,
                 dropout: float = 0.2,
                 learning_rate: float = 0.001):
        self.sequence_length = sequence_length
        self.units = units or [128, 64, 32]
        self.dropout = dropout
        self.learning_rate = learning_rate
        self.model = None
        
    def build_model(self, input_shape: Tuple[int, int]):
        """Build LSTM architecture"""
        try:
            import tensorflow as tf
            from tensorflow.keras.models import Sequential
            from tensorflow.keras.layers import LSTM, Dense, Dropout
            
            model = Sequential()
            
            # First LSTM layer
            model.add(LSTM(self.units[0], 
                          return_sequences=len(self.units) > 1,
                          input_shape=input_shape))
            model.add(Dropout(self.dropout))
            
            # Additional LSTM layers
            for i, units in enumerate(self.units[1:], 1):
                return_sequences = i < len(self.units) - 1
                model.add(LSTM(units, return_sequences=return_sequences))
                model.add(Dropout(self.dropout))
            
            # Output layer
            model.add(Dense(1, activation='sigmoid'))
            
            model.compile(
                optimizer=tf.keras.optimizers.Adam(learning_rate=self.learning_rate),
                loss='binary_crossentropy',
                metrics=['accuracy']
            )
            
            self.model = model
            
        except ImportError:
            raise ImportError("TensorFlow not installed. Run: pip install tensorflow")
    
    def fit(self, X: np.ndarray, y: np.ndarray, 
            epochs: int = 100, 
            batch_size: int = 32,
            validation_split: float = 0.2) -> None:
        """Train the model"""
        if self.model is None:
            self.build_model((X.shape[1], X.shape[2]))
            
        self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=0
        )
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        return (self.model.predict(X) > 0.5).astype(int).flatten()
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Get prediction probabilities"""
        return self.model.predict(X).flatten()


class XGBoostModel(MLModel):
    """
    XGBoost model for feature-based prediction
    """
    
    def __init__(self,
                 max_depth: int = 6,
                 learning_rate: float = 0.1,
                 n_estimators: int = 100,
                 subsample: float = 0.8):
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.n_estimators = n_estimators
        self.subsample = subsample
        self.model = None
        
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        """Train the model"""
        try:
            import xgboost as xgb
            
            self.model = xgb.XGBClassifier(
                max_depth=self.max_depth,
                learning_rate=self.learning_rate,
                n_estimators=self.n_estimators,
                subsample=self.subsample,
                objective='binary:logistic',
                eval_metric='logloss'
            )
            
            self.model.fit(X, y)
            
        except ImportError:
            raise ImportError("XGBoost not installed. Run: pip install xgboost")
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        return self.model.predict(X)
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Get prediction probabilities"""
        return self.model.predict_proba(X)[:, 1]


class FeatureEngineer:
    """
    Feature engineering for ML models
    """
    
    @staticmethod
    def create_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from OHLCV data
        """
        features = pd.DataFrame(index=df.index)
        
        # Price-based features
        features['returns_1d'] = df['close'].pct_change(1)
        features['returns_5d'] = df['close'].pct_change(5)
        features['returns_10d'] = df['close'].pct_change(10)
        features['returns_20d'] = df['close'].pct_change(20)
        
        # Volatility features
        features['volatility_5d'] = df['close'].pct_change().rolling(5).std()
        features['volatility_20d'] = df['close'].pct_change().rolling(20).std()
        
        # Technical indicators
        # RSI
        delta = df['close'].diff()
        gain = delta.where(delta > 0, 0).rolling(14).mean()
        loss = -delta.where(delta < 0, 0).rolling(14).mean()
        rs = gain / loss
        features['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD
        ema_12 = df['close'].ewm(span=12, adjust=False).mean()
        ema_26 = df['close'].ewm(span=26, adjust=False).mean()
        features['macd'] = ema_12 - ema_26
        features['macd_signal'] = features['macd'].ewm(span=9, adjust=False).mean()
        
        # Bollinger Bands
        sma_20 = df['close'].rolling(20).mean()
        std_20 = df['close'].rolling(20).std()
        features['bb_position'] = (df['close'] - sma_20) / (2 * std_20)
        
        # Volume features
        features['volume_sma'] = df['volume'].rolling(20).mean()
        features['volume_ratio'] = df['volume'] / features['volume_sma']
        
        # Price position
        features['price_to_sma20'] = df['close'] / sma_20
        features['price_to_sma50'] = df['close'] / df['close'].rolling(50).mean()
        
        return features.dropna()
    
    @staticmethod
    def create_sequences(data: np.ndarray, 
                         sequence_length: int) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create sequences for LSTM
        """
        X, y = [], []
        
        for i in range(len(data) - sequence_length):
            X.append(data[i:(i + sequence_length)])
            y.append(data[i + sequence_length, 0])  # Predict next close direction
            
        return np.array(X), np.array(y)


class EnsemblePredictor:
    """
    Ensemble of LSTM and XGBoost models
    """
    
    def __init__(self,
                 lstm_weight: float = 0.5,
                 xgb_weight: float = 0.5):
        self.lstm_model = LSTMModel()
        self.xgb_model = XGBoostModel()
        self.lstm_weight = lstm_weight
        self.xgb_weight = xgb_weight
        self.feature_engineer = FeatureEngineer()
        
    def fit(self, df: pd.DataFrame) -> None:
        """
        Train both models
        """
        # Create features
        features = self.feature_engineer.create_features(df)
        
        # Create target (1 if next day up, 0 if down)
        target = (df['close'].shift(-1) > df['close']).astype(int).loc[features.index]
        
        # Train XGBoost
        X_xgb = features.values[:-1]  # Exclude last row (no target)
        y_xgb = target.values[:-1]
        self.xgb_model.fit(X_xgb, y_xgb)
        
        # Train LSTM
        X_lstm, y_lstm = self.feature_engineer.create_sequences(
            features.values, 
            self.lstm_model.sequence_length
        )
        # Convert to classification
        y_lstm = (y_lstm > features.values[self.lstm_model.sequence_length:-1, 0]).astype(int)
        self.lstm_model.fit(X_lstm, y_lstm)
        
    def predict(self, df: pd.DataFrame) -> Prediction:
        """
        Make ensemble prediction
        """
        features = self.feature_engineer.create_features(df)
        
        # XGBoost prediction
        xgb_proba = self.xgb_model.predict_proba(features.values[-1:])[0]
        
        # LSTM prediction
        sequence = features.values[-self.lstm_model.sequence_length:]
        sequence = sequence.reshape(1, sequence.shape[0], sequence.shape[1])
        lstm_proba = self.lstm_model.predict_proba(sequence)[0]
        
        # Weighted ensemble
        ensemble_proba = (
            self.lstm_weight * lstm_proba + 
            self.xgb_weight * xgb_proba
        )
        
        direction = 1 if ensemble_proba > 0.5 else -1
        confidence = abs(ensemble_proba - 0.5) * 2  # Scale to 0-1
        
        return Prediction(
            direction=direction,
            confidence=confidence,
            probability=ensemble_proba
        )
