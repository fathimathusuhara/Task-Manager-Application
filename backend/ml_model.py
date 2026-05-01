import os
import random
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'delay_model.pkl')

def synthesize_and_train():
    """Generates synthetic data and trains a Logistic Regression model for Task Delay Prediction."""
    
    # 1. Generate Synthetic Data
    # Features:
    # - description_length: 10 to 1000 characters
    # - concurrent_tasks: 0 to 10 tasks
    # - past_completion_rate: 0.0 to 1.0
    
    # Target:
    # - delayed: 0 or 1
    
    n_samples = 500
    data = []
    
    for _ in range(n_samples):
        desc_len = random.randint(10, 1000)
        concurrent = random.randint(0, 10)
        completion_rate = random.uniform(0.1, 1.0)
        
        # Simple heuristic to define 'delayed' probabilistically
        # Higher complexity, more concurrent tasks, and lower completion rate -> higher chance of delay
        score = (desc_len / 1000.0) * 0.4 + (concurrent / 10.0) * 0.4 + (1.0 - completion_rate) * 0.5
        
        delayed = 1 if score > random.uniform(0.4, 0.8) else 0
        data.append([desc_len, concurrent, completion_rate, delayed])
        
    df = pd.DataFrame(data, columns=['desc_len', 'concurrent', 'completion_rate', 'delayed'])
    
    X = df[['desc_len', 'concurrent', 'completion_rate']]
    y = df['delayed']
    
    # 2. Build and Train Model
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('logreg', LogisticRegression(random_state=42))
    ])
    
    pipeline.fit(X, y)
    
    # 3. Save Model
    joblib.dump(pipeline, MODEL_PATH)
    print("Model trained and saved successfully to", MODEL_PATH)

def predict_delay_probability(desc_len: int, concurrent: int, completion_rate: float) -> float:
    """Loads the model and predicts delay probability."""
    if not os.path.exists(MODEL_PATH):
        synthesize_and_train()
        
    model = joblib.load(MODEL_PATH)
    
    # model.predict_proba returns [[prob_0, prob_1]]
    prob_delayed = model.predict_proba([[desc_len, concurrent, completion_rate]])[0][1]
    return float(prob_delayed)

if __name__ == '__main__':
    synthesize_and_train()
