def read_fb_ads_lib_data(file_input:str)->pd.DataFrame:
    """
    This function reads the FB ads lib Data and add a new Aux Column to the table for further calculations.
    """

    df = pd.read_csv(file_input)

    # Create Aux Column
    df.loc[:, "Count"] = 1

    return df