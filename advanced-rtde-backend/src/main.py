from fastapi import FastAPI
from pydantic import BaseModel
from connector import RTDEConnect
import logging
import threading
import datetime

app = FastAPI()

ROBOT_HOST = 'urcontrol-rtde'
CONFIG_FILENAME = 'rtdeIO.xml'

rtde_connect = None
latest_state = {}
monitor_thread = None
stop_event = threading.Event()

logging.basicConfig(level=logging.INFO)
logging.info(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Uvicorn server booted...")

class StateUpdate(BaseModel):
    updates: dict

def monitor_runtime_state(rtde_instance, stop_event):
    global latest_state
    previous_state = {
        'runtime_state': None,
        'safety_status': None,
        'actual_TCP_pose': None,
        'actual_q': None,
        # Add more fields as needed
    }

    try:
        while not stop_event.is_set():
            if not rtde_instance.con or not rtde_instance.con.is_connected():
                logging.info('RTDE connection closed.')
                break

            state = rtde_instance.receive()
            if state is None:
                break

            updates = {}

            # Check for changes in each monitored field
            for field in previous_state.keys():
                current_value = getattr(state, field, None)
                if current_value != previous_state[field]:
                    updates[field] = current_value
                    previous_state[field] = current_value

            # Update the global state if any field has changed
            if updates:
                latest_state.update(updates)
                logging.debug(f"State updated: {latest_state}")
    except AttributeError as e:
        logging.error(f"AttributeError: {e}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")


@app.post("/start")
async def start_monitoring():
    global rtde_connect, stop_event, monitor_thread
    stop_event.clear()
    rtde_connect = RTDEConnect(ROBOT_HOST, CONFIG_FILENAME)
    logging.info('Monitoring started.')
    monitor_thread = threading.Thread(target=monitor_runtime_state, args=(rtde_connect, stop_event))
    monitor_thread.start()
    return {"message": "Started monitoring runtime state"}

@app.post("/stop")
async def stop_monitoring():
    global rtde_connect, stop_event, monitor_thread
    stop_event.set()
    if monitor_thread:
        monitor_thread.join()  # Wait for the monitoring thread to finish
    if rtde_connect:
        rtde_connect.shutdown()
        rtde_connect = None
        logging.info('Monitoring stopped.')
    return {"message": "Stopped monitoring runtime state"}

@app.get("/state")
async def get_latest_state():
    return latest_state