# loads the csv file into the dataframe, chooses the 100 columns 
# with the highest sum-per column, and writes those to another csv
# author: Alexander Lex

import pandas as pd
import numpy as np


df = pd.read_csv('gbm_mutated.csv', index_col=0, delim_whitespace=True)

sum_values = df.sum().order(ascending=False).head(5)

top100 = df[sum_values.index]
top100.to_csv('gbm_mutated_top5.csv',  sep=';');
